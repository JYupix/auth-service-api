import { Resend } from "resend";
import {
  verificationEmailTemplate,
  welcomeEmailTemplate,
} from "./emailTemplates.js";
import { ENV } from "../config/env.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmailVerification = async (
  email: string,
  token: string,
  username: string,
): Promise<void> => {
  const verificationUrl = `${ENV.FRONTEND_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verify Your Email",
    html: verificationEmailTemplate(verificationUrl, username),
  });
};

export const sendWelcomeEmail = async (
  email: string,
  username: string,
): Promise<void> => {
  const loginUrl = `${process.env.FRONTEND_URL}/login`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Welcome to Our Service!",
    html: welcomeEmailTemplate(username, loginUrl),
  });
};
