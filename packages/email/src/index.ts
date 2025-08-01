import "server-only";

import type { ReactElement } from "react";

import { render } from "@react-email/components";
import nodemailer from "nodemailer";

import { env } from "./lib/env";

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  email: string;
  subject: string;
  react?: ReactElement;
  text?: string;
}

export const sendEmail = async ({ email, subject, react, text }: SendEmailOptions) => {
  return await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject,
    text,
    html: await render(react),
  });
};
