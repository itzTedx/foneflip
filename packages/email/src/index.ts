export const sendEmail = async () => {
  console.info(
    "Email sending failed: Neither SMTP nor Resend is configured. Please set up at least one email service to send emails."
  );
};
