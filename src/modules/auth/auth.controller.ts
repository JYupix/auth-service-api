import { Request, Response, NextFunction } from "express";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.schema.js";
import { clearAuthCookie, clearRefreshCookie, setAuthCookie, setRefreshCookie } from "../../utils/cookies.js";
import bcrypt from "bcrypt";
import { prisma } from "../../config/db.js";
import {
  generateAuthToken,
  generatePasswordResetToken,
  generateRefreshToken,
  generateVerificationToken,
  verifyToken,
} from "../../utils/jwt.js";
import {
  sendEmailVerification,
  sendPasswordResetConfirmationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../../services/email.service.js";
import { logAction } from "../../config/logger.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { name, username, email, password } = registerSchema.parse(req.body);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      password: hashedPassword,
    },
  });

  const verificationToken = generateVerificationToken(user.id);
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationToken,
      verificationTokenExpiry,
    },
  });

  await sendEmailVerification(email, verificationToken, username);

  const {
    password: _,
    verificationToken: __,
    verificationTokenExpiry: ___,
    ...userData
  } = updatedUser;

  logAction("user.register", { email, username });
  res.status(201).json({
    message:
      "User registered successfully. Please check your email to verify your account.",
    user: userData,
  });
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { token } = verifyEmailSchema.parse(req.query);

  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      verificationTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    res.status(400).json({
      message: "Invalid or expired verification token",
    });
    return;
  }

  if (user.emailVerified) {
    res.status(400).json({ message: "Email is already verified" });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerifiedAt: new Date(),
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  });

  await sendWelcomeEmail(user.email, user.username);

  logAction("user.verify_email", { userId: user.id });
  res.status(200).json({ message: "Email verified successfully" });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      password: true,
      profileImage: true,
      bio: true,
      role: true,
      emailVerified: true,
      lastLogin: true,
      tokenVersion: true,
      createdAt: true,
    },
  });

  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  if (!user.emailVerified) {
    res.status(403).json({
      message: "Please verify your email before logging in",
    });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const token = generateAuthToken(
    user.id,
    user.email,
    user.role,
    user.tokenVersion,
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  setAuthCookie(res, token);
  setRefreshCookie(res, generateRefreshToken(user.id, user.tokenVersion));

  const { password: _, ...userData } = user;

  logAction("user.login", { userId: user.id, email });
  res.status(200).json({
    message: "Login successful",
    user: userData,
  });
};

export const logout = (req: Request, res: Response): void => {
  logAction("user.logout", { userId: req.user?.userId ?? "unknown" });
  clearAuthCookie(res);
  clearRefreshCookie(res);

  res.status(200).json({
    message: "Logout successful",
  });
};

export const refresh = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const token = req.cookies.refresh_token;

  if (!token) {
    res.status(401).json({ message: "No refresh token provided." });
    return;
  }

  const decoded = verifyToken(token);

  if (decoded.type !== "refresh") {
    res.status(401).json({ message: "Invalid token type." });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, role: true, tokenVersion: true },
  });

  if (!user || user.tokenVersion !== decoded.tokenVersion) {
    res.status(403).json({ message: "Session expired. Please log in again." });
    return;
  }

  const newAccessToken = generateAuthToken(user.id, user.email, user.role, user.tokenVersion);
  setAuthCookie(res, newAccessToken);

  logAction("user.token_refresh", { userId: user.id });
  res.status(200).json({ message: "Token refreshed" });
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { email } = forgotPasswordSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    const resetToken = generatePasswordResetToken(user.id);
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordTokenExpiry: resetTokenExpiry,
      },
    });

    await sendPasswordResetEmail(email, resetToken, user.username);
  }

  logAction("user.forgot_password_request", { email });
  res.status(200).json({
    message:
      "If an account with that email exists, a password reset link has been sent.",
  });
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { token } = verifyEmailSchema.parse(req.query);
  const { password } = resetPasswordSchema.parse(req.body);

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    res.status(400).json({
      message: "Invalid or expired password reset token",
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      tokenVersion: { increment: 1 },
      lastPasswordChange: new Date(),
      resetPasswordToken: null,
      resetPasswordTokenExpiry: null,
    },
  });

  await sendPasswordResetConfirmationEmail(user.email, user.username);

  clearAuthCookie(res);

  logAction("user.reset_password", { userId: user.id });
  res.status(200).json({
    message: "Password reset successful. Please log in with your new password.",
  });
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      profileImage: true,
      bio: true,
      role: true,
      emailVerified: true,
      lastLogin: true,
      createdAt: true,
    },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  logAction("auth.get_current_user", { userId });
  res.status(200).json({ user });
};
