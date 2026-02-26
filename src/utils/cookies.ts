import { Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutos
  });
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
  });
};

export const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie("refresh_token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  });
};

export const clearRefreshCookie = (res: Response): void => {
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
  });
};