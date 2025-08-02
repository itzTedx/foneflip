import { redirect } from "next/navigation";

import { IconLogoMono } from "@ziron/ui/assets/logo";
import { Card, CardContent } from "@ziron/ui/card";

import { getSession } from "@/lib/auth/server";
import { OtpVerificationForm } from "@/modules/vendors/components/forms/otp-verification";

type SearchParams = Promise<{ email: string }>;

export default async function VerificationPage({ searchParams }: { searchParams: SearchParams }) {
  const { email } = await searchParams;

  const session = await getSession();

  if (session?.user && session.user.email === email && session.user.emailVerified) {
    // User is already verified, redirect to personal-info
    redirect("/onboarding/info");
  }

  return (
    <div className="relative flex h-full items-center justify-center">
      <div className="flex flex-1 flex-col items-center justify-center">
        <Card className="relative overflow-hidden rounded-2xl p-0 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="-top-1/2 -translate-y-[10%] absolute inset-x-0 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]">
            <div className="absolute top-0 right-0 left-0 m-auto h-[310px] w-[310px] rounded-full bg-brand-secondary opacity-20 blur-[100px]" />
          </div>
          <CardContent className="z-10 p-6 px-9">
            <div className="mx-auto grid size-12 place-content-center rounded-full border-background border-t bg-gradient-to-tr from-primary to-brand-secondary shadow-lg shadow-primary/30 dark:border-foreground/60">
              <IconLogoMono aria-hidden={true} className="size-7 text-white" />
            </div>

            <h3 className="mt-3 text-center font-semibold text-foreground text-lg">Check Your Email</h3>
            <p className="mx-auto max-w-[40ch] text-balance text-center font-light text-muted-foreground text-sm">
              We&apos;ve sent you a verification otp to your email. Please verify to continue onboarding.
            </p>
            <OtpVerificationForm email={email} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
