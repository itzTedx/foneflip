import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
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
  businessName: string;
}

const VendorApprovalEmail = ({ businessName }: Props) => {
  return (
    <Html dir="ltr" lang="en">
      <Tailwind>
        <Head />
        <Preview>Welcome to Foneflip! Your vendor application has been approved</Preview>
        <Body className="bg-[#f2f2fa] py-[40px] font-sans">
          <Container className="mx-auto max-w-[600px] rounded-[8px] bg-white px-[40px] py-[40px]">
            {/* Header with Logo */}
            <Section className="mb-[32px] text-center">
              <Img
                alt="Foneflip"
                className="mx-auto h-auto w-full max-w-[200px]"
                src="https://di867tnz6fwga.cloudfront.net/brand-kits/453a191a-fef2-4ba6-88fe-b9e7a16650cd/primary/a14c98ef-2a94-4c00-91e4-6e1dedfcd261.png"
              />
            </Section>

            {/* Main Content */}
            <Section>
              <Heading className="mb-[24px] text-center font-bold text-[#0b0917] text-[28px]">Congratulations!</Heading>

              <Text className="mb-[20px] text-[#0b0917] text-[16px] leading-[24px]">Hi there,</Text>

              <Text className="mb-[20px] text-[#0b0917] text-[16px] leading-[24px]">
                We're excited to welcome {businessName ? ` ${businessName}` : "you"} to the Foneflip marketplace! Your
                application has been reviewed and approved by our team. You can now start listing your products and
                growing your business with us.
              </Text>

              <Text className="mb-[24px] text-[#0b0917] text-[16px] leading-[24px]">
                As part of our community, you'll be joining a platform dedicated to sustainable tech consumption,
                helping customers access high-quality refurbished devices while building a thriving business.
              </Text>

              {/* Next Steps Section */}
              <Section className="mb-[24px] rounded-[8px] border-[#e6e6f0] border-[1px] border-solid bg-[#f8f8ff] p-[24px]">
                <Heading className="mb-[16px] font-bold text-[#0b0917] text-[20px]">What's Next?</Heading>
                <Text className="m-0 mb-[12px] text-[#0b0917] text-[14px] leading-[20px]">
                  • Log into your vendor dashboard to complete your profile
                </Text>
                <Text className="m-0 mb-[12px] text-[#0b0917] text-[14px] leading-[20px]">
                  • Upload your first product listings with detailed descriptions
                </Text>
                <Text className="m-0 mb-[12px] text-[#0b0917] text-[14px] leading-[20px]">
                  • Set up your payment and shipping preferences
                </Text>
                <Text className="m-0 text-[#0b0917] text-[14px] leading-[20px]">
                  • Start receiving orders from our growing customer base
                </Text>
              </Section>

              {/* CTA Button */}
              <Section className="mb-[32px] text-center">
                <Button
                  className="box-border rounded-[8px] bg-[#4A3AFF] px-[32px] py-[16px] font-semibold text-[16px] text-white no-underline"
                  href="https://www.foneflip.com"
                >
                  Access Your Dashboard
                </Button>
              </Section>

              <Text className="mb-[20px] text-[#0b0917] text-[16px] leading-[24px]">
                Our team is here to support you every step of the way. If you have any questions about getting started,
                product listings, or platform features, don't hesitate to reach out.
              </Text>

              <Text className="mb-[24px] text-[#0b0917] text-[16px] leading-[24px]">
                Welcome aboard, and here's to building something great together!
              </Text>

              <Text className="text-[#0b0917] text-[16px] leading-[24px]">
                Best regards,
                <br />
                The Foneflip Team
              </Text>
            </Section>

            <Hr className="my-[32px] border-[#e6e6f0]" />

            {/* Footer */}
            <Section>
              <Row>
                <Column>
                  <Text className="m-0 text-[#666666] text-[12px] leading-[16px]">
                    Foneflip
                    <br />
                    Gubaiba, Dubai, UAE
                  </Text>
                </Column>
                <Column className="text-right">
                  <Link className="mr-[8px] inline-block" href="https://www.instagram.com/foneflip_com/">
                    <Img
                      alt="Instagram"
                      className="h-[24px] w-[24px]"
                      src="https://new.email/static/emails/social/social-instagram.png"
                    />
                  </Link>
                </Column>
              </Row>

              <Text className="m-0 mt-[16px] text-[#666666] text-[12px] leading-[16px]">
                © 2025 Foneflip. All rights reserved.
              </Text>

              <Text className="m-0 mt-[12px] text-[#666666] text-[10px] leading-[14px]">
                This email may contain confidential or promotional content for the intended recipient. Product info may
                change without notice. By reading, you agree to Foneflip's Terms and Policies. If received in error,
                please delete and inform us.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

VendorApprovalEmail.PreviewProps = {
  businessName: "Tech Solutions LLC",
};

export default VendorApprovalEmail;
