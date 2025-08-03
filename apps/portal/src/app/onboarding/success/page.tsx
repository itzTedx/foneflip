import { CheckCircle } from "lucide-react";

import { Card, CardContent } from "@ziron/ui/card";

export default async function CompletePage() {
  return (
    <div className="relative flex h-full items-center justify-center">
      <div className="flex flex-1 flex-col justify-center">
        <Card className="relative overflow-hidden rounded-2xl p-0 sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="-top-1/2 -translate-y-[10%] absolute inset-x-0 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]">
            <div className="absolute top-0 right-0 left-0 m-auto h-[310px] w-[310px] rounded-full bg-brand-secondary opacity-20 blur-[100px]" />
          </div>
          <CardContent className="z-10 p-6 px-9">
            <div className="mt-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>

              <h3 className="mb-2 font-semibold text-foreground text-xl">Onboarding Complete!</h3>

              <p className="mb-6 text-muted-foreground text-sm">
                Thank you for completing your vendor onboarding. Your documents have been uploaded successfully and are
                being reviewed by our team.
              </p>

              <div className="space-y-3 text-left">
                <div className="rounded-lg bg-muted/50 p-3">
                  <h4 className="mb-1 font-medium text-sm">What happens next?</h4>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>• Our team will review your submitted documents</li>
                    <li>• You&apos;ll receive an email confirmation within 24-48 hours</li>
                    <li>• Once approved, you can start listing your products</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
