"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@ziron/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useForm, zodResolver } from "@ziron/ui/form";
import { Input } from "@ziron/ui/input";
import { LoadingSwap } from "@ziron/ui/loading-swap";
import { PersonalInfoFormData, personalInfoSchema } from "@ziron/validators";

import { updateVendorPersonalInfoAction } from "../../actions/mutation";

export function PersonalInfoForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: "",
      mobile: "",
      whatsapp: "",
      position: "",
    },
  });

  function onSubmit(data: PersonalInfoFormData) {
    startTransition(async () => {
      try {
        const result = await updateVendorPersonalInfoAction(data);

        if (!result.success) {
          toast.error("error" in result ? result.error : "Failed to save personal information");
          return;
        }

        toast.success("Personal information saved successfully");
        router.push("/vendor/onboarding/business-info");
      } catch (err) {
        console.error("Failed to save personal information:", err);
        toast.error("Failed to save personal information");
      }
    });
  }

  return (
    <Form {...form}>
      <form className="mt-8 flex w-full flex-col items-center space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Mobile Number</FormLabel>
              <FormControl>
                <Input placeholder="+971 50 123 4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="whatsapp"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>WhatsApp Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="+971 50 123 4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Position</FormLabel>
              <FormControl>
                <Input placeholder="Owner, Sales, Partner, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" disabled={isPending} type="submit">
          <LoadingSwap isLoading={isPending}>Continue</LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
