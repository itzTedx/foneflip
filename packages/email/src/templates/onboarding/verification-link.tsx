import {
  Body,
  Button,
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

const VerificationEmail = (props: {
  verificationUrl: string;
  userEmail: string;
}) => {
  const {
    verificationUrl = "https://www.foneflip.com/verify?token=abc123",
    userEmail = "melwinafs@gmail.com",
  } = props;

  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>
          ✨ Welcome to Foneflip! Verify your account to unlock amazing tech
          deals
        </Preview>
        <Body className="bg-[#f2f2fa] py-[40px] font-sans">
          <Container className="mx-auto max-w-[600px] overflow-hidden rounded-[16px] bg-white shadow-lg">
            {/* Header with gradient background */}
            <Section className="bg-gradient-to-r from-[#4A3AFF] to-[#6366f1] px-[40px] py-[48px] text-center">
              <Img
                src="https://di867tnz6fwga.cloudfront.net/brand-kits/453a191a-fef2-4ba6-88fe-b9e7a16650cd/primary/a14c98ef-2a94-4c00-91e4-6e1dedfcd261.png"
                alt="Foneflip"
                className="mx-auto mb-[24px] h-auto w-full max-w-[180px] object-cover"
              />
              <Heading className="m-0 mb-[8px] text-[28px] font-bold">
                Welcome to Foneflip! 🎉
              </Heading>
              <Text className="m-0 text-[16px] leading-[24px]">
                Your journey to sustainable tech starts here
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="px-[40px] py-[48px]">
              <Text className="mb-[24px] text-[18px] leading-[28px] font-medium text-[#0b0917]">
                Hey there! 👋
              </Text>

              <Text className="mb-[24px] text-[16px] leading-[26px] text-[#0b0917]">
                Thanks for joining our community of smart shoppers who believe
                in quality tech without the premium price tag. We're excited to
                help you discover amazing deals on certified refurbished
                devices!
              </Text>

              {/* Verification Card */}
              <Section className="mb-[32px] rounded-[12px] border border-solid border-[#e2e8f0] bg-[#f8fafc] p-[32px] text-center">
                <Text className="mb-[24px] text-[16px] leading-[24px] font-medium text-[#0b0917]">
                  Let's verify your email to unlock your account:
                </Text>

                <Button
                  href={verificationUrl}
                  className="box-border rounded-[12px] bg-[#4A3AFF] px-[40px] py-[16px] text-[16px] font-semibold text-white no-underline shadow-lg transition-all duration-200 hover:bg-[#3730d9]"
                >
                  ✨ Verify My Account
                </Button>

                <Text className="mt-[16px] mb-[0px] text-[14px] leading-[20px] text-[#64748b]">
                  This link expires in 24 hours for your security
                </Text>
              </Section>

              {/* Alternative Link */}
              <Section className="mb-[32px]">
                <Text className="mb-[8px] text-[14px] leading-[20px] text-[#64748b]">
                  Having trouble with the button? Copy and paste this link:
                </Text>
                <Text className="rounded-[8px] border border-solid border-[#e2e8f0] bg-[#f1f5f9] p-[12px] text-[14px] leading-[20px] break-all text-[#4A3AFF]">
                  <Link
                    href={verificationUrl}
                    className="text-[#4A3AFF] no-underline"
                  >
                    {verificationUrl}
                  </Link>
                </Text>
              </Section>

              {/* Benefits Grid */}
              <Section className="mb-[32px]">
                <Heading className="mb-[24px] text-[20px] font-bold text-[#0b0917]">
                  What's waiting for you:
                </Heading>

                <Row className="mb-[16px]">
                  <Column>
                    <Text className="mb-[12px] text-[15px] leading-[24px] text-[#0b0917]">
                      🔍 <strong>Quality Guaranteed</strong>
                      <br />
                      <span className="text-[#64748b]">
                        Certified refurbished devices with warranty protection
                      </span>
                    </Text>
                  </Column>
                </Row>

                <Row className="mb-[16px]">
                  <Column>
                    <Text className="mb-[12px] text-[15px] leading-[24px] text-[#0b0917]">
                      💰 <strong>Unbeatable Prices</strong>
                      <br />
                      <span className="text-[#64748b]">
                        Premium tech at prices that won't break the bank
                      </span>
                    </Text>
                  </Column>
                </Row>

                <Row className="mb-[16px]">
                  <Column>
                    <Text className="mb-[12px] text-[15px] leading-[24px] text-[#0b0917]">
                      🌱 <strong>Eco-Conscious Choice</strong>
                      <br />
                      <span className="text-[#64748b]">
                        Support sustainable tech consumption and reduce e-waste
                      </span>
                    </Text>
                  </Column>
                </Row>

                <Row>
                  <Column>
                    <Text className="mb-[0px] text-[15px] leading-[24px] text-[#0b0917]">
                      🚀 <strong>Seamless Experience</strong>
                      <br />
                      <span className="text-[#64748b]">
                        Easy browsing, secure checkout, and reliable delivery
                      </span>
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* CTA Section */}
              <Section className="rounded-[12px] border border-solid border-[#4A3AFF]/20 bg-gradient-to-r from-[#4A3AFF]/5 to-[#6366f1]/5 p-[24px] text-center">
                <Text className="mb-[16px] text-[16px] leading-[24px] font-medium text-[#0b0917]">
                  Ready to start shopping smarter? 🛒
                </Text>
                <Text className="mb-[0px] text-[14px] leading-[22px] text-[#64748b]">
                  Once verified, you'll have instant access to our entire
                  collection of premium refurbished devices.
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section className="border-t border-solid border-[#e2e8f0] bg-[#f8fafc] px-[40px] py-[32px]">
              <Row className="mb-[24px]">
                <Column className="text-center">
                  <Text className="mb-[8px] text-[14px] leading-[20px] font-medium text-[#0b0917]">
                    Need help getting started?
                  </Text>
                  <Text className="mb-[16px] text-[14px] leading-[20px] text-[#64748b]">
                    Our support team is here for you at{" "}
                    <Link
                      href="mailto:support@foneflip.com"
                      className="font-medium text-[#4A3AFF] no-underline"
                    >
                      support@foneflip.com
                    </Link>
                  </Text>
                </Column>
              </Row>

              <Row className="mb-[24px]">
                <Column className="text-center">
                  <Link
                    href="https://www.foneflip.com"
                    className="mr-[16px] text-[14px] font-medium text-[#4A3AFF] no-underline"
                  >
                    Visit Store
                  </Link>
                  <Link
                    href="https://www.instagram.com/foneflip_com/"
                    className="text-[14px] font-medium text-[#4A3AFF] no-underline"
                  >
                    Follow Us
                  </Link>
                </Column>
              </Row>

              <Row>
                <Column className="text-center">
                  <Text className="m-0 mb-[8px] text-[12px] leading-[18px] text-[#64748b]">
                    Gubaiba, Dubai, UAE
                  </Text>
                  <Text className="m-0 mb-[12px] text-[12px] leading-[18px] text-[#64748b]">
                    © 2025 Foneflip. All rights reserved.
                  </Text>
                  <Text className="m-0 text-[11px] leading-[16px] text-[#64748b]">
                    This email may contain confidential or promotional content
                    for the intended recipient. Product info may change without
                    notice. By reading, you agree to Foneflip's Terms and
                    Policies. If received in error, please delete and inform us.
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

VerificationEmail.PreviewProps = {
  verificationUrl: "https://www.foneflip.com/verify?token=abc123",
  userEmail: "melwinafs@gmail.com",
};

export default VerificationEmail;
