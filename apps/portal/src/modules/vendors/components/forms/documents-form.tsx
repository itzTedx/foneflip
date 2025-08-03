"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@ziron/ui/button";
import { Form, FormField, FormItem, FormMessage, useForm, zodResolver } from "@ziron/ui/form";
import { LoadingSwap } from "@ziron/ui/loading-swap";
import { DocumentsFormData, documentsSchema } from "@ziron/validators";

import { useOnboarding } from "@/hooks/use-onboarding";

import { updateVendorDocuments } from "../../actions/mutation";
import { DocumentUpload } from "./document-upload";

interface Props {
  userId: string;
}

export function DocumentsForm({ userId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { saveData, isLoading: isOnboardingLoading } = useOnboarding(userId);

  const form = useForm<DocumentsFormData>({
    resolver: zodResolver(documentsSchema),
    defaultValues: {
      tradeLicense: undefined,
      emiratesIdFront: undefined,
      emiratesIdBack: undefined,
    },
  });

  function onSubmit(data: DocumentsFormData) {
    startTransition(async () => {
      try {
        const result = await updateVendorDocuments(data);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        // Save documents data
        await saveData({
          documents: {
            tradeLicense: data.tradeLicense?.url,
            emiratesIdFront: data.emiratesIdFront?.url,
            emiratesIdBack: data.emiratesIdBack?.url,
          },
        });

        toast.success("Documents uploaded successfully!");
        try {
          router.push("/onboarding/success");
        } catch (navError) {
          console.error("Navigation failed:", navError);
          toast.error("Upload successful, but navigation failed. Please refresh the page.");
        }
      } catch (error) {
        console.error("Failed to save documents:", error);
        toast.error("Failed to save documents");
      }
    });
  }
  return (
    <Form {...form}>
      <form className="mt-8 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-6">
            <FormField
              control={form.control}
              name="emiratesIdFront"
              render={({ field }) => (
                <FormItem>
                  <DocumentUpload
                    accept="image/*"
                    description="Upload a clear image of the front side of your Emirates ID"
                    label="Emirates ID Front"
                    name="emiratesIdFront"
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    value={field.value}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emiratesIdBack"
              render={({ field }) => (
                <FormItem>
                  <DocumentUpload
                    accept="image/*"
                    description="Upload a clear image of the back side of your Emirates ID"
                    label="Emirates ID Back"
                    name="emiratesIdBack"
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    value={field.value}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="tradeLicense"
            render={({ field }) => (
              <FormItem>
                <DocumentUpload
                  accept="application/pdf,image/*"
                  description="Upload your trade license document (PDF or image)"
                  label="Trade License"
                  name="tradeLicense"
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  value={field.value}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between">
          <Button onClick={() => router.back()} type="button" variant="outline">
            Back
          </Button>
          <Button disabled={isPending || isOnboardingLoading} type="submit">
            <LoadingSwap isLoading={isPending || isOnboardingLoading}>Complete Onboarding</LoadingSwap>
          </Button>
        </div>
      </form>
    </Form>
  );
}
