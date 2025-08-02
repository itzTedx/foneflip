import { sendEmail } from "@ziron/email";
import VendorOTPEmail from "@ziron/email/templates/auth-otp";

export async function sendOTPEmail({
  to,
  otp,
  name,
  type = "verification",
}: {
  to: string;
  otp: string;
  name?: string;
  type: "verification" | "login" | "password-reset";
}) {
  const getSubject = () => {
    switch (type) {
      case "login":
        return "Your FoneFlip Login Code";
      case "password-reset":
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
