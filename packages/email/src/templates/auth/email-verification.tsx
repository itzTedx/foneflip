import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

const EmailVerification = (props: { verificationUrl: string }) => {
  const { verificationUrl } = props;

  return (
    <Html dir="ltr" lang="en">
      <Head />
      <Preview>Verify your email to complete your Foneflip account setup</Preview>
      <Tailwind>
        <Body className="bg-[#f2f2fa] py-[40px] font-sans">
          <Container className="mx-auto max-w-[600px] overflow-hidden rounded-[8px] bg-white">
            {/* Header with Logo */}
            <Section className="bg-white px-[40px] pt-[40px] pb-[24px]">
              <Img
                alt="Foneflip"
                className="h-auto w-[120px]"
                src="https://di867tnz6fwga.cloudfront.net/brand-kits/453a191a-fef2-4ba6-88fe-b9e7a16650cd/primary/a14c98ef-2a94-4c00-91e4-6e1dedfcd261.png"
              />
            </Section>

            {/* Main Content */}
            <Section className="px-[40px] pb-[40px]">
              <Heading className="mt-0 mb-[16px] font-bold text-[#0b0917] text-[24px]">
                Verify Your Email Address
              </Heading>

              <Text className="mt-0 mb-[24px] text-[#0b0917] text-[16px] leading-[24px]">
                Welcome to Foneflip! We're excited to have you join our community of smart tech shoppers.
              </Text>

              <Text className="mt-0 mb-[24px] text-[#0b0917] text-[16px] leading-[24px]">
                To complete your account setup and start exploring our collection of quality refurbished devices, please
                verify your email address by clicking the button below:
              </Text>

              {/* Verification Button */}
              <Section className="mb-[32px] text-center">
                <Button
                  className="box-border inline-block rounded-[8px] bg-[#4A3AFF] px-[32px] py-[12px] font-semibold text-[16px] text-white no-underline"
                  href={verificationUrl}
                >
                  Verify Email Address
                </Button>
              </Section>

              <Text className="mt-0 mb-[16px] text-[#0b0917] text-[14px] leading-[20px]">
                If the button doesn't work, you can also copy and paste this link into your browser:
              </Text>

              <Text className="mt-0 mb-[24px] break-all text-[#4A3AFF] text-[14px] leading-[20px]">
                <Link className="text-[#4A3AFF] underline" href={verificationUrl}>
                  {verificationUrl}
                </Link>
              </Text>

              <Text className="mt-0 mb-[24px] text-[#0b0917] text-[14px] leading-[20px]">
                This verification link will expire in 24 hours for your security. If you didn't create an account with
                Foneflip, you can safely ignore this email.
              </Text>

              <Text className="mt-0 mb-[8px] text-[#0b0917] text-[16px] leading-[24px]">
                Once verified, you'll be able to:
              </Text>

              <Text className="mt-0 mb-[4px] ml-[16px] text-[#0b0917] text-[14px] leading-[20px]">
                • Browse our certified refurbished smartphones and laptops
              </Text>
              <Text className="mt-0 mb-[4px] ml-[16px] text-[#0b0917] text-[14px] leading-[20px]">
                • Enjoy warranty-backed purchases with quality guarantees
              </Text>
              <Text className="mt-0 mb-[4px] ml-[16px] text-[#0b0917] text-[14px] leading-[20px]">
                • Access exclusive deals and member-only offers
              </Text>
              <Text className="mt-0 mb-[24px] ml-[16px] text-[#0b0917] text-[14px] leading-[20px]">
                • Track your orders and manage your account easily
              </Text>

              <Text className="mt-0 mb-[8px] text-[#0b0917] text-[16px] leading-[24px]">
                Thanks for choosing sustainable tech with Foneflip!
              </Text>

              <Text className="mt-0 mb-[0px] text-[#0b0917] text-[16px] leading-[24px]">The Foneflip Team</Text>
            </Section>

            {/* Footer */}
            <Section className="bg-[#f2f2fa] px-[40px] py-[32px]">
              <Text className="mt-0 mb-[16px] text-center text-[#0b0917] text-[12px] leading-[16px]">
                <Link className="text-[#4A3AFF] underline" href="https://www.foneflip.com">
                  Foneflip
                </Link>
                {" • "}
                <Link className="text-[#4A3AFF] underline" href="https://www.instagram.com/foneflip_com/">
                  Follow us on Instagram
                </Link>
              </Text>

              <Text className="m-0 mt-0 mb-[8px] text-center text-[#0b0917] text-[12px] leading-[16px]">
                Gubaiba, Dubai, UAE
              </Text>

              <Text className="mt-0 mb-[16px] text-center text-[#0b0917] text-[12px] leading-[16px]">
                <Link className="text-[#4A3AFF] underline" href="https://www.foneflip.com">
                  Unsubscribe
                </Link>
                {" • "}
                <Link className="text-[#4A3AFF] underline" href="https://www.foneflip.com">
                  Privacy Policy
                </Link>
              </Text>

              <Text className="mt-0 mb-[8px] text-center text-[#0b0917] text-[10px] leading-[14px]">
                This email may contain confidential or promotional content for the intended recipient. Product info may
                change without notice. By reading, you agree to Foneflip's Terms and Policies. If received in error,
                please delete and inform us.
              </Text>

              <Text className="m-0 mt-0 mb-0 text-center text-[#0b0917] text-[10px] leading-[14px]">
                © 2025 Foneflip. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

EmailVerification.PreviewProps = {
  userEmail: "melwinafs@gmail.com",
  verificationUrl: "https://www.foneflip.com/verify-email?token=abc123xyz789",
};

export default EmailVerification;
