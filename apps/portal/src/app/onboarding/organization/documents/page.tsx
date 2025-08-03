import { redirect } from "next/navigation";

import { IconLogoMono } from "@ziron/ui/assets/logo";
import { Card, CardContent } from "@ziron/ui/card";

import { getSession } from "@/lib/auth/server";
import { DocumentsForm } from "@/modules/vendors/components/forms/documents-form";

export default async function OrganizationDocumentsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/verify/error?type=validation&message=User+ID+is+required&status=400");
  }

  return (
    <div className="relative flex h-full items-center justify-center">
      <div className="flex flex-1 flex-col items-center justify-center">
        <Card className="relative overflow-hidden rounded-2xl p-0 sm:mx-auto sm:w-full sm:max-w-3xl">
          {/* <BackgroundPattern /> */}
          <CardContent className="z-10 p-6 px-9">
            <div className="mx-auto grid size-12 place-content-center rounded-full border-background border-t bg-gradient-to-tr from-primary to-brand-secondary shadow-lg shadow-primary/30 dark:border-foreground/60">
              <IconLogoMono aria-hidden={true} className="size-7 text-white" />
            </div>
            <h3 className="mt-3 text-center font-semibold text-foreground text-lg">Business Documents</h3>
            <p className="mx-auto max-w-[40ch] text-balance text-center font-light text-muted-foreground text-sm">
              Please upload the following documents to complete your organization onboarding.
            </p>

            <DocumentsForm userId={session.user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
