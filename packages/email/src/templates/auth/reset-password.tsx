import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

const PasswordResetEmail = ({ resetUrl, userEmail }: { resetUrl: string; userEmail: string }) => {
  return (
    <Html dir="ltr" lang="en">
      <Head />
      <Preview>Reset your Foneflip password - Quick and secure access to your account</Preview>
      <Tailwind>
        <Body className="bg-[#f2f2fa] py-[40px] font-sans">
          <Container className="mx-auto max-w-[600px] rounded-[8px] bg-white px-[40px] py-[40px]">
            {/* Logo Section */}
            <Section className="mb-[32px] text-center">
              <Img
                alt="Foneflip"
                className="mx-auto h-auto w-full max-w-[200px] object-cover"
                src="https://di867tnz6fwga.cloudfront.net/brand-kits/453a191a-fef2-4ba6-88fe-b9e7a16650cd/primary/a14c98ef-2a94-4c00-91e4-6e1dedfcd261.png"
              />
            </Section>

            {/* Main Content */}
            <Section>
              <Heading className="mb-[24px] text-center font-bold text-[#0b0917] text-[24px]">
                Reset Your Password
              </Heading>

              <Text className="mb-[16px] text-[#0b0917] text-[16px] leading-[24px]">Hi there,</Text>

              <Text className="mb-[16px] text-[#0b0917] text-[16px] leading-[24px]">
                We received a request to reset the password for your Foneflip account ({userEmail}). No worries - it
                happens to the best of us!
              </Text>

              <Text className="mb-[32px] text-[#0b0917] text-[16px] leading-[24px]">
                Click the button below to create a new password and get back to discovering amazing deals on refurbished
                tech that's good for your wallet and the planet.
              </Text>

              {/* Reset Button */}
              <Section className="mb-[32px] text-center">
                <Button
                  className="box-border inline-block rounded-[8px] bg-[#4A3AFF] px-[32px] py-[16px] font-semibold text-[16px] text-white"
                  href={resetUrl}
                >
                  Reset My Password
                </Button>
              </Section>

              <Text className="mb-[16px] text-[#0b0917] text-[14px] leading-[20px]">
                Or copy and paste this link into your browser:
              </Text>

              <Text className="mb-[24px] break-all text-[#4A3AFF] text-[14px] leading-[20px]">
                <Link className="text-[#4A3AFF]" href={resetUrl}>
                  {resetUrl}
                </Link>
              </Text>

              <Text className="mb-[16px] text-[#0b0917] text-[14px] leading-[20px]">
                <strong>This link will expire in 24 hours</strong> for your security.
              </Text>

              <Text className="mb-[24px] text-[#0b0917] text-[14px] leading-[20px]">
                If you didn't request this password reset, you can safely ignore this email. Your account remains secure
                and no changes will be made.
              </Text>

              <Hr className="my-[32px] border-[#f2f2fa]" />

              <Text className="mb-[16px] text-[#0b0917] text-[16px] leading-[24px]">
                Need help? We're here for you! Visit our{" "}
                <Link className="text-[#4A3AFF]" href="https://www.foneflip.com">
                  support center
                </Link>{" "}
                or reply to this email.
              </Text>

              <Text className="text-[#0b0917] text-[16px] leading-[24px]">
                Thanks for choosing Foneflip for your tech needs!
                <br />
                The Foneflip Team
              </Text>
            </Section>

            {/* Footer */}
            <Hr className="my-[32px] border-[#f2f2fa]" />

            <Section className="text-center">
              <Text className="mb-[16px] text-[#0b0917] text-[12px] leading-[16px]">
                Follow us on{" "}
                <Link className="text-[#4A3AFF]" href="https://www.instagram.com/foneflip_com/">
                  Instagram
                </Link>
              </Text>

              <Text className="m-0 mb-[8px] text-[#0b0917] text-[12px] leading-[16px]">
                Foneflip
                <br />
                Gubaiba, Dubai, UAE
              </Text>

              <Text className="m-0 mb-[16px] text-[#0b0917] text-[12px] leading-[16px]">
                © 2025 Foneflip. All rights reserved.
              </Text>

              <Text className="mb-[8px] text-[#0b0917] text-[10px] leading-[14px]">
                This email may contain confidential or promotional content for the intended recipient. Product info may
                change without notice. By reading, you agree to Foneflip's Terms and Policies. If received in error,
                please delete and inform us.
              </Text>

              <Text className="text-[#0b0917] text-[12px] leading-[16px]">
                <Link className="text-[#4A3AFF]" href="https://www.foneflip.com">
                  Unsubscribe
                </Link>
                {" | "}
                <Link className="text-[#4A3AFF]" href="https://www.foneflip.com">
                  Privacy Policy
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

PasswordResetEmail.PreviewProps = {
  resetUrl: "https://www.foneflip.com/reset-password?token=abc123xyz789",
  userEmail: "melwinafs@gmail.com",
};

export default PasswordResetEmail;
