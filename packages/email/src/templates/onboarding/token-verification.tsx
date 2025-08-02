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

interface Props {
  vendorName: string;
  verificationLink: string;
  inviterName: string;
  expiresIn: string;
}

const VendorInvitationEmail = ({ vendorName, verificationLink, inviterName, expiresIn }: Props) => {
  return (
    <Html dir="ltr" lang="en">
      <Head />
      <Preview>Join Foneflip's vendor network - Verify your account to start selling</Preview>
      <Tailwind>
        <Body className="bg-[#f2f2fa] py-[40px] font-sans">
          <Container className="mx-auto max-w-[600px] overflow-hidden rounded-[12px] bg-white shadow-sm">
            {/* Header */}
            <Section className="bg-white px-[48px] pt-[48px] pb-[32px]">
              <Img
                alt="Foneflip"
                className="h-auto w-full max-w-[180px]"
                src="https://di867tnz6fwga.cloudfront.net/brand-kits/453a191a-fef2-4ba6-88fe-b9e7a16650cd/primary/a14c98ef-2a94-4c00-91e4-6e1dedfcd261.png"
              />
            </Section>

            {/* Hero Section */}
            <Section className="px-[48px] pb-[40px]">
              <Heading className="mt-0 mb-[16px] font-bold text-[#0b0917] text-[32px] leading-[38px]">
                Welcome to our vendor network
              </Heading>

              <Text className="mt-0 mb-[32px] text-[#666666] text-[18px] leading-[26px]">
                Join the sustainable tech revolution and grow your business with Foneflip
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="px-[48px]">
              <Text className="mt-0 mb-[24px] text-[#0b0917] text-[16px] leading-[24px]">Hi {vendorName},</Text>

              <Text className="mt-0 mb-[24px] text-[#0b0917] text-[16px] leading-[24px]">
                {inviterName} has invited you to become a trusted vendor partner on Foneflip. We're building the future
                of sustainable tech commerce, and we'd love to have you on board.
              </Text>

              <Text className="mt-0 mb-[40px] text-[#0b0917] text-[16px] leading-[24px]">
                Our platform connects quality-focused vendors with conscious consumers who value both affordability and
                environmental responsibility.
              </Text>

              {/* CTA Section */}
              <Section className="mb-[40px] rounded-[12px] border border-[#e2e8f0] border-solid bg-[#f8fafc] p-[40px] text-center ">
                <Heading className="mt-0 mb-[12px] font-bold text-[#0b0917] text-[24px]">Ready to get started?</Heading>

                <Text className="mt-0 mb-[24px] text-[#666666] text-[16px] leading-[24px]">
                  Verify your account to access your vendor dashboard and begin the onboarding process.
                </Text>

                <Button
                  className="box-border inline-block rounded-[8px] bg-[#4A3AFF] px-[40px] py-[16px] font-semibold text-[16px] text-white no-underline"
                  href={verificationLink}
                >
                  Verify Account
                </Button>

                <Text className="mt-[24px] mb-0 text-[#999999] text-[14px] leading-[20px]">
                  Verification link expires in {expiresIn} hours
                </Text>
              </Section>

              {/* Alternative Link */}
              <Section className="mb-[32px]">
                <Text className="mb-[8px] text-[#64748b] text-[14px] leading-[20px]">
                  Having trouble with the button? Copy and paste this link:
                </Text>
                <Text className="break-all rounded-[8px] border border-[#e2e8f0] border-solid bg-[#f1f5f9] p-[12px] text-[#4A3AFF] text-[14px] leading-[20px]">
                  <Link className="text-[#4A3AFF] no-underline" href={verificationLink}>
                    {verificationLink}
                  </Link>
                </Text>
              </Section>

              <Hr className="my-[32px] border-[#e6e6e6]" />

              {/* Stats/Benefits Cards */}
              <Section className="mb-[40px]">
                <div className="grid grid-cols-1 gap-[16px]">
                  <Section className="rounded-[8px] border border-[#e8eaff] border-solid bg-[#f8f9ff] p-[24px]">
                    <Text className="mt-0 mb-[8px] font-semibold text-[#4A3AFF] text-[14px] uppercase tracking-wide">
                      Market Access
                    </Text>
                    <Text className="mt-0 mb-0 text-[#0b0917] text-[16px] leading-[22px]">
                      Reach thousands of customers seeking certified refurbished devices
                    </Text>
                  </Section>

                  <Section className="rounded-[8px] border border-[#e8eaff] border-solid bg-[#f8f9ff] p-[24px]">
                    <Text className="mt-0 mb-[8px] font-semibold text-[#4A3AFF] text-[14px] uppercase tracking-wide">
                      Growth Tools
                    </Text>
                    <Text className="mt-0 mb-0 text-[#0b0917] text-[16px] leading-[22px]">
                      Advanced analytics, inventory management, and marketing support
                    </Text>
                  </Section>

                  <Section className="rounded-[8px] border border-[#e8eaff] border-solid bg-[#f8f9ff] p-[24px]">
                    <Text className="mt-0 mb-[8px] font-semibold text-[#4A3AFF] text-[14px] uppercase tracking-wide">
                      Reliable Payments
                    </Text>
                    <Text className="mt-0 mb-0 text-[#0b0917] text-[16px] leading-[22px]">
                      Competitive rates with fast, secure payment processing
                    </Text>
                  </Section>
                </div>
              </Section>

              <Hr className="my-[32px] border-[#e6e6e6]" />

              {/* Process Steps */}
              <Section className="mb-[40px]">
                <Heading className="mt-0 mb-[24px] font-bold text-[#0b0917] text-[20px]">
                  Your onboarding journey
                </Heading>

                <Section className="mb-[20px]">
                  <Text className="mt-0 mb-[4px] font-bold text-[#4A3AFF] text-[14px]">
                    Step 1 → Account Verification
                  </Text>
                  <Text className="mt-0 mb-0 text-[#666666] text-[14px] leading-[20px]">
                    Click the verification link to activate your vendor account
                  </Text>
                </Section>

                <Section className="mb-[20px]">
                  <Text className="mt-0 mb-[4px] font-bold text-[#4A3AFF] text-[14px]">Step 2 → Business Profile</Text>
                  <Text className="mt-0 mb-0 text-[#666666] text-[14px] leading-[20px]">
                    Complete your business information and upload required documents
                  </Text>
                </Section>

                <Section className="mb-[20px]">
                  <Text className="mt-0 mb-[4px] font-bold text-[#4A3AFF] text-[14px]">Step 3 → Product Catalog</Text>
                  <Text className="mt-0 mb-0 text-[#666666] text-[14px] leading-[20px]">
                    Add your inventory and set up your product listings
                  </Text>
                </Section>

                <Section className="mb-0">
                  <Text className="mt-0 mb-[4px] font-bold text-[#4A3AFF] text-[14px]">Step 4 → Go Live</Text>
                  <Text className="mt-0 mb-0 text-[#666666] text-[14px] leading-[20px]">
                    Account review and approval within 24-48 hours
                  </Text>
                </Section>
              </Section>

              {/* Support */}
              <Section className="mb-[32px] text-center">
                <Text className="mt-0 mb-[8px] text-[#666666] text-[16px] leading-[24px]">
                  Questions? We're here to help.
                </Text>
                <Link className="font-medium text-[#4A3AFF] text-[16px]" href="mailto:vendors@foneflip.com">
                  Contact Vendor Support
                </Link>
              </Section>

              <Text className="mt-0 mb-0 text-[#0b0917] text-[16px] leading-[24px]">
                Looking forward to partnering with you,
                <br />
                <span className="font-medium">The Foneflip Team</span>
              </Text>
            </Section>

            {/* Footer */}
            <Section className="mt-[48px] bg-[#fafbff] px-[48px] py-[40px]">
              <Section className="mb-[24px] text-center">
                <Link className="inline-block" href="https://www.instagram.com/foneflip_com/">
                  <Img
                    alt="Instagram"
                    className="h-[24px] w-[24px]"
                    src="https://new.email/static/emails/social/social-instagram.png"
                  />
                </Link>
              </Section>

              <Text className="mt-0 mb-[16px] text-center text-[#666666] text-[14px] leading-[20px]">
                <Link className="text-[#4A3AFF] no-underline" href="https://www.foneflip.com">
                  www.foneflip.com
                </Link>
              </Text>

              <Text className="m-0 mt-0 mb-[16px] text-center text-[#666666] text-[12px] leading-[18px]">
                Foneflip
                <br />
                Gubaiba, Dubai, UAE
              </Text>

              <Text className="mt-0 mb-[12px] text-center text-[#999999] text-[11px] leading-[16px]">
                This email may contain confidential or promotional content for the intended recipient. Product info may
                change without notice. By reading, you agree to Foneflip's Terms and Policies. If received in error,
                please delete and inform us.
              </Text>

              <Text className="m-0 mt-0 mb-0 text-center text-[#999999] text-[11px] leading-[16px]">
                © 2025 Foneflip. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

VendorInvitationEmail.PreviewProps = {
  vendorName: "TechHub Solutions",
  verificationLink: "https://www.foneflip.com/vendor/verify?token=abc123xyz789",
  inviterName: "Sarah from Foneflip",
};

export default VendorInvitationEmail;
