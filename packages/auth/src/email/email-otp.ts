import { sendEmail } from "@ziron/email";
import VendorOTPEmail from "@ziron/email/templates/auth-otp";

export async function sendOTPEmail({
  to,
  otp,
  name,
  type,
  expiresIn,
}: {
  to: string;
  otp: string;
  name?: string;
  type: "sign-in" | "email-verification" | "forget-password";
  expiresIn?: number;
}) {
  const getSubject = () => {
    switch (type) {
      case "sign-in":
        return "Your FoneFlip Login Code";
      case "email-verification":
        return "Verify Your FoneFlip Account";
      case "forget-password":
        return "Reset Your FoneFlip Password";
      default:
        return "Verify Your FoneFlip Account";
    }
  };

  try {
    await sendEmail({
      email: to,
      subject: getSubject(),
      react: VendorOTPEmail({ otp, username: name, type, expiresIn }),
    });
  } catch (error) {
    console.error(`Failed to send OTP email to ${to}:`, error);
    throw new Error("Failed to send verification email");
  }
}
