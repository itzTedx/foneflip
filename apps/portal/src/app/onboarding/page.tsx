import { redirect } from "next/navigation";

import { IconLogoMono } from "@ziron/ui/assets/logo";
import { Card, CardContent } from "@ziron/ui/card";

import { BackgroundPattern } from "@/components/background-pattern";
import { OnboardingProgressIndicator } from "@/components/onboarding/progress-indicator";
import { getInvitationByToken } from "@/modules/vendors/actions/queries";
import VendorRegisterForm from "@/modules/vendors/components/forms/registration-form";

type SearchParams = Promise<{ token: string | undefined }>;

export default async function VendorOnboardingPage({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/");
  }

  const res = await getInvitationByToken(token);

  // Handle error cases
  if (!res.success) {
    return (
      <main className="grid h-svh overflow-hidden">
        <div className="h-svh w-full p-3">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 grid size-16 place-content-center rounded-full bg-destructive/10">
                <svg
                  className="size-8 text-destructive"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <h2 className="mb-2 font-semibold text-foreground text-xl">Invalid Invitation</h2>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="relative flex h-full items-center justify-center">
      <div className="flex flex-1 flex-col items-center justify-center">
        <Card className="relative overflow-hidden rounded-2xl p-0 sm:mx-auto sm:w-full sm:max-w-4xl">
          <BackgroundPattern />
          <CardContent className="z-10 p-6 px-9">
            <div className="mx-auto grid size-12 place-content-center rounded-full border-background border-t bg-gradient-to-tr from-primary to-brand-secondary shadow-lg shadow-primary/30 dark:border-foreground/60">
              <IconLogoMono aria-hidden={true} className="size-7 text-white" />
            </div>

            <h3 className="mt-3 text-center font-semibold text-foreground text-lg">Sign Up as a Verified Vendor</h3>
            <p className="mx-auto max-w-[30ch] text-balance text-center font-light text-muted-foreground text-xs">
              Become part of Foneflip&apos;s trusted UAE-based vendor network.
            </p>

            {/* Progress Indicator */}
            <div className="mt-6 mb-8">
              <OnboardingProgressIndicator className="mb-6" currentStep="registration" userId="temp-user-id" />
            </div>

            <VendorRegisterForm invitation={res.data} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
