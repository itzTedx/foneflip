import {
  Body,
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
  reason: string;
}

const VendorRejectionEmail = ({ businessName, reason }: Props) => {
  return (
    <Html dir="ltr" lang="en">
      <Tailwind>
        <Head />
        <Preview>Update on your Foneflip vendor application</Preview>
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
              <Heading className="mb-[24px] text-center font-bold text-[#0b0917] text-[28px]">
                Application Update
              </Heading>

              <Text className="mb-[20px] text-[#0b0917] text-[16px] leading-[24px]">
                Hi{businessName ? ` ${businessName} team` : " there"},
              </Text>

              <Text className="mb-[20px] text-[#0b0917] text-[16px] leading-[24px]">
                Thank you for your interest in joining the Foneflip marketplace as a vendor. We appreciate the time and
                effort you put into your application.
              </Text>

              <Text className="mb-[24px] text-[#0b0917] text-[16px] leading-[24px]">
                After careful review, we've decided not to move forward with your application at this time. This
                decision was not made lightly, and we understand this may be disappointing news.
              </Text>

              {/* Custom Message Section */}
              {reason && (
                <Section className="mb-[24px] rounded-[8px] border-[#e6e6f0] border-[1px] border-solid bg-[#f8f8ff] p-[24px]">
                  <Heading className="mb-[16px] font-bold text-[#0b0917] text-[18px]">Feedback from Our Team</Heading>
                  <Text className="m-0 text-[#0b0917] text-[14px] leading-[20px]">{reason}</Text>
                </Section>
              )}

              <Text className="mb-[20px] text-[#0b0917] text-[16px] leading-[24px]">
                We encourage you to consider reapplying in the future as your business grows and evolves. Our
                marketplace is constantly expanding, and we're always looking for quality vendors who align with our
                mission of sustainable tech consumption.
              </Text>

              <Text className="mb-[20px] text-[#0b0917] text-[16px] leading-[24px]">
                If you have any questions about this decision or would like additional feedback, please don't hesitate
                to reach out to our vendor relations team. We're here to help and support businesses in the tech space.
              </Text>

              <Text className="mb-[24px] text-[#0b0917] text-[16px] leading-[24px]">
                Thank you again for considering Foneflip as your marketplace partner. We wish you all the best in your
                business endeavors.
              </Text>

              <Text className="text-[#0b0917] text-[16px] leading-[24px]">
                Best regards,
                <br />
                The Foneflip Vendor Relations Team
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

              <Text className="m-0 mt-[12px] text-[#666666] text-[12px] leading-[16px]">
                <Link className="text-[#4A3AFF] no-underline" href="https://www.foneflip.com">
                  Contact Us
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

VendorRejectionEmail.PreviewProps = {
  businessName: "Tech Solutions LLC",
  reason:
    "While we appreciate your application, we found that your current product catalog doesn't fully align with our focus on certified refurbished devices. We'd love to see more documentation around your quality assurance processes and warranty offerings for future applications.",
};

export default VendorRejectionEmail;
