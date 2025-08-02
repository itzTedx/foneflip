import { sendEmail } from "@ziron/email";
import VendorOTPEmail from "@ziron/email/templates/auth-otp";

export async function sendOTPEmail({
  to,
  otp,
  name,
  type = "email-verification",
}: {
  to: string;
  otp: string;
  name?: string;
  type: "sign-in" | "email-verification" | "forget-password";
}) {
  const getSubject = () => {
    switch (type) {
      case "sign-in":
        return "Your FoneFlip Login Code";
      case "email-verification":
        return "Reset Your FoneFlip Password";
      default:
        return "Verify Your FoneFlip Account";
    }
  };

  await sendEmail({
    email: to,
    subject: getSubject(),
    react: VendorOTPEmail({ otp, username: name, type }),
  });
}
