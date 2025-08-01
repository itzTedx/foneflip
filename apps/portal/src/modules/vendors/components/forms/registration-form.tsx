"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@ziron/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useForm, zodResolver } from "@ziron/ui/form";
import { Input } from "@ziron/ui/input";
import { LoadingSwap } from "@ziron/ui/loading-swap";
import { VendorRegistrationFormData, vendorRegistrationSchema } from "@ziron/validators";

import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth/client";

import { InvitationType } from "../../types";

interface Props {
  invitation: InvitationType;
}

export default function VendorRegisterForm({ invitation }: Props) {
  const router = useRouter();
  const [emailPending, startEmailTransition] = useTransition();

  const form = useForm<VendorRegistrationFormData>({
    resolver: zodResolver(vendorRegistrationSchema),
    defaultValues: {
      name: invitation.vendorName,
      email: invitation.vendorEmail,
      password: "",
    },
  });

  async function onSubmit(data: VendorRegistrationFormData) {
    startEmailTransition(async () => {
      try {
        const result = { success: true, error: null };
        // const result = await signUpEmailAction(data);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        if (result.success) {
          await authClient.emailOtp.sendVerificationOtp({
            email: data.email,
            type: "email-verification",
            fetchOptions: {
              onSuccess: () => {
                toast.success("Account created successfully! Please check your email for verification.");
                router.push(`/onboarding/verify-otp?email=${data.email}`);
              },
              onError: (error) => {
                toast.error(error.error.message);
              },
            },
          });
        }
      } catch (error) {
        toast.error("An unexpected error occurred. Please try again.");
        console.error("Vendor signup error:", error);
      }
    });
  }

  return (
    <Form {...form}>
      <form className="mt-9" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe@mail.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput id="password" onChange={field.onChange} placeholder="Password" value={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full" disabled={emailPending} type="submit">
            <LoadingSwap isLoading={emailPending}>Continue</LoadingSwap>
          </Button>
        </div>
      </form>
    </Form>
  );
}
