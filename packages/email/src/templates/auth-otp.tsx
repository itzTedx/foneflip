import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface Props {
  username?: string;
  otp: string;
  type: "verification" | "login" | "password-reset";
}

const OTPEmail = ({ username, otp, type }: Props) => {
  // Dynamic content based on type
  const getContent = () => {
    switch (type) {
      case "login":
        return {
          subject: "Your sign-in verification code",
          heading: "Sign In to Your Account",
          greeting: `Hi${username ? ` ${username},` : ""}`,
          mainText:
            "We received a request to sign in to your Foneflip account. To complete your sign-in and access your dashboard, please use the verification code below.",
          ctaText: "Continue to Dashboard",
          ctaUrl: "https://www.foneflip.com/dashboard",
        };
      case "verification":
        return {
          subject: "Verify your email address",
          heading: "Verify Your Email Address",
          greeting: `Welcome to Foneflip${username ? `, ${username}` : ""}!`,
          mainText:
            "Thanks for joining our community of smart shoppers! To complete your account setup and start exploring quality refurbished tech devices, please verify your email address using the code below.",
          ctaText: "Complete Verification",
          ctaUrl: "https://www.foneflip.com/verify-email",
        };
      case "password-reset":
        return {
          subject: "Reset your password",
          heading: "Reset Your Password",
          greeting: `Hi${username ? ` ${username},` : ""}`,
          mainText:
            "We received a request to reset your password for your Foneflip account. To create a new password and regain access to your account, please use the verification code below.",
          ctaText: "Reset Password",
          ctaUrl: "https://www.foneflip.com/reset-password",
        };
      default:
        return {
          subject: "Your verification code",
          heading: "Verification Required",
          greeting: `Hi${username ? ` ${username},` : ""}`,
          mainText: "Please use the verification code below to complete your request.",
          ctaText: "Continue",
          ctaUrl: "https://www.foneflip.com",
        };
    }
  };

  const content = getContent();

  return (
    <Html dir="ltr" lang="en">
      <Head />
      <Preview>{content.subject} - Foneflip</Preview>
      <Tailwind>
        <Body className="bg-[#f2f2fa] py-[40px] font-sans">
          <Container className="mx-auto max-w-[600px] overflow-hidden rounded-[8px] bg-[#FFF]">
            {/* Header with Logo */}
            <Section className="bg-white px-[40px] pt-[40px] pb-[20px]">
              <Img
                alt="Foneflip"
                className="h-auto w-full max-w-[200px]"
                src="https://di867tnz6fwga.cloudfront.net/brand-kits/453a191a-fef2-4ba6-88fe-b9e7a16650cd/primary/a14c98ef-2a94-4c00-91e4-6e1dedfcd261.png"
              />
            </Section>

            {/* Main Content */}
            <Section className="px-[40px] py-[20px]">
              <Heading className="mt-0 mb-[20px] font-bold text-[#0b0917] text-[24px]">{content.heading}</Heading>

              <Text className="mt-0 mb-[20px] text-[#0b0917] text-[16px] leading-[24px]">{content.greeting}</Text>

              <Text className="mt-0 mb-[20px] text-[#0b0917] text-[16px] leading-[24px]">{content.mainText}</Text>

              {/* OTP Code Section */}
              <Section className="mb-[30px] rounded-[8px] border border-[#e9ecef] border-solid bg-[#f8f9fa] p-[30px] text-center">
                <Text className="mt-0 mb-[10px] font-medium text-[#0b0917] text-[14px]">Your verification code:</Text>
                <Text className="mt-0 mb-0 font-bold font-mono text-[#4A3AFF] text-[32px] tracking-[8px]">{otp}</Text>
              </Section>

              <Text className="mt-0 mb-[20px] text-[#0b0917] text-[16px] leading-[24px]">
                This code will expire in <strong>10 minutes</strong>. If you didn't request this verification, please
                ignore this email or contact our support team.
              </Text>

              {type === "verification" && (
                <Text className="mt-0 mb-[30px] text-[#0b0917] text-[16px] leading-[24px]">
                  Once verified, you'll have full access to browse and purchase quality refurbished smartphones,
                  laptops, and tech accessories at unbeatable prices—helping you save money while supporting sustainable
                  tech consumption.
                </Text>
              )}

              {type === "password-reset" && (
                <Text className="mt-0 mb-[30px] text-[#0b0917] text-[16px] leading-[24px]">
                  For your security, this code can only be used once. If you continue to have trouble accessing your
                  account, please reach out to our support team for assistance.
                </Text>
              )}

              {type === "login" && (
                <Text className="mt-0 mb-[30px] text-[#0b0917] text-[16px] leading-[24px]">
                  Once signed in, you can continue browsing our latest deals on certified refurbished devices, track
                  your orders, and manage your account preferences.
                </Text>
              )}

              {/* Call to Action */}
              <Section className="mb-[30px] text-center">
                <Link
                  className="box-border inline-block rounded-[6px] bg-[#4A3AFF] px-[30px] py-[12px] font-medium text-[16px] text-white no-underline"
                  href={content.ctaUrl}
                >
                  {content.ctaText}
                </Link>
              </Section>

              <Text className="mt-0 mb-0 text-[#666666] text-[14px] leading-[20px]">
                Need help? Contact our support team at{" "}
                <Link className="text-[#4A3AFF] no-underline" href="mailto:support@foneflip.com">
                  support@foneflip.com
                </Link>
              </Text>
            </Section>

            {/* Footer */}
            <Section className="border-[#e9ecef] border-t border-solid bg-[#f8f9fa] px-[40px] py-[30px]">
              <Row>
                <Column>
                  <Text className="m-0 mt-0 mb-[10px] text-[#666666] text-[12px] leading-[16px]">
                    <strong>Foneflip</strong>
                    <br />
                    Gubaiba, Dubai, UAE
                  </Text>

                  <Text className="mt-0 mb-[15px] text-[#666666] text-[12px] leading-[16px]">
                    <Link className="text-[#4A3AFF] no-underline" href="https://www.foneflip.com">
                      Visit our website
                    </Link>{" "}
                    |
                    <Link
                      className="ml-[5px] text-[#4A3AFF] no-underline"
                      href="https://www.instagram.com/foneflip_com/"
                    >
                      Follow us on Instagram
                    </Link>
                  </Text>

                  <Text className="mt-0 mb-[10px] text-[#666666] text-[11px] leading-[14px]">
                    This email may contain confidential or promotional content for the intended recipient. Product info
                    may change without notice. By reading, you agree to Foneflip's Terms and Policies. If received in
                    error, please delete and inform us.
                  </Text>

                  <Text className="m-0 mt-0 mb-0 text-[#666666] text-[11px] leading-[14px]">
                    © 2025 Foneflip. All rights reserved.
                  </Text>
                </Column>
              </Row>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

OTPEmail.PreviewProps = {
  username: "Sarah",
  otp: "847392",
  type: "verification",
};

export default OTPEmail;
