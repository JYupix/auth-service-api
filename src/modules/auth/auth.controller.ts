import { Request, Response, NextFunction } from "express";
import { registerSchema, verifyEmailSchema } from "./auth.schema.js";
import bcrypt from "bcrypt";
import { prisma } from "../../config/db.js";
import { generateVerificationToken } from "../../utils/jwt.js";
import {
  sendEmailVerification,
  sendWelcomeEmail,
} from "../../services/email.service.js";

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

  res.status(201).json({
    success: true,
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
    res
      .status(400)
      .json({
        success: false,
        message: "Invalid or expired verification token",
      });
    return;
  }

  if (user.emailVerified) {
    res
      .status(400)
      .json({ success: false, message: "Email is already verified" });
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

  res
    .status(200)
    .json({ success: true, message: "Email verified successfully" });
};
