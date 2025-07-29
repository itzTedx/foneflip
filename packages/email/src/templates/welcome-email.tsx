import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export default function WelcomeEmail({
  name = "Brendon Urie",
}: {
  name: string | null;
}) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Dub</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[600px] rounded border border-neutral-200 border-solid px-10 py-5">
            <Heading className="mx-0 my-7 p-0 font-semibold text-black text-xl">
              Welcome {name ?? "to Dub"}!
            </Heading>
            <Text className="mb-8 text-gray-600 text-sm leading-6">
              Thank you for signing up for Dub! You can now start creating short
              links, track conversions, and explore our API.
            </Text>

            <Hr />

            <Heading className="mx-0 my-6 p-0 font-semibold text-black text-lg">
              Getting started
            </Heading>

            <Text className="mb-4 text-gray-600 text-sm leading-6">
              <strong className="font-medium text-black">
                1. Set up your domain
              </strong>
              :{" "}
              <Link
                className="font-semibold text-black underline underline-offset-4"
                href="https://dub.co/help/article/how-to-add-custom-domain"
              >
                Add a custom domain
              </Link>{" "}
              or{" "}
              <Link
                className="font-semibold text-black underline underline-offset-4"
                href="https://dub.co/help/article/free-dot-link-domain"
              >
                claim a free .link domain
              </Link>{" "}
              and start creating your short links.
            </Text>

            <Text className="mb-4 text-gray-600 text-sm leading-6">
              <strong className="font-medium text-black">
                2. View analytics
              </strong>
              : Monitor{" "}
              <Link
                className="font-semibold text-black underline underline-offset-4"
                href="https://dub.co/help/article/dub-analytics"
              >
                click data
              </Link>{" "}
              in real time to see what's working.
            </Text>

            <Text className="mb-4 text-gray-600 text-sm leading-6">
              <strong className="font-medium text-black">
                3. Track conversions
              </strong>
              : Measure how your links convert to signups and sales with our
              built-in{" "}
              <Link
                className="font-semibold text-black underline underline-offset-4"
                href="https://dub.co/help/article/dub-conversions"
              >
                conversion tracking API
              </Link>
              .
            </Text>

            <Text className="mb-8 text-gray-600 text-sm leading-6">
              <strong className="font-medium text-black">
                4. Explore the API
              </strong>
              :{" "}
              <Link
                className="font-semibold text-black underline underline-offset-4"
                href="https://dub.co/docs/introduction"
              >
                Check out our docs
              </Link>{" "}
              for programmatic link creation.
            </Text>

            <Section className="mb-8">
              <Link
                className="rounded-lg bg-black px-6 py-3 text-center font-semibold text-[12px] text-white no-underline"
                href="https://app.dub.co"
              >
                Go to your dashboard
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
