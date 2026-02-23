import { Role } from "@prisma/client";

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  tokenVersion: number;
  type: string;
  iat?: number;
  exp?: number;
}