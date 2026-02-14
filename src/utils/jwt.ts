import jwt from "jsonwebtoken";

export const generateVerificationToken = (userId: string): string => {
  return jwt.sign({ userId, type: "verification" }, process.env.JWT_SECRET!, {
    expiresIn: "24h",
  });
};

