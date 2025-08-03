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
import { signUpEmailAction } from "@/modules/auth/actions/mutations";
import { useOnboarding } from "@/modules/onboarding";

import { InvitationType } from "../../types";

interface Props {
  invitation: InvitationType;
}

export default function VendorRegisterForm({ invitation }: Props) {
  const router = useRouter();
  const [emailPending, startEmailTransition] = useTransition();
  const { saveData, isLoading: isOnboardingLoading } = useOnboarding(invitation.id);

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
        const result = await signUpEmailAction(data);
        if (result.error) {
          toast.error(result.error);
          return;
        }

        if (result.success) {
          // Save registration data
          await saveData({
            registration: {
              name: data.name,
              email: data.email,
              invitationToken: invitation.token,
            },
          });

          await authClient.emailOtp.sendVerificationOtp({
            email: data.email,
            type: "email-verification",
            fetchOptions: {
              onSuccess: () => {
                toast.success("Account created successfully! Please check your email for verification.");
                router.push(`/onboarding/verification?email=${encodeURIComponent(data.email)}`);
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
                  <PasswordInput placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full" disabled={emailPending || isOnboardingLoading} type="submit">
            <LoadingSwap isLoading={emailPending || isOnboardingLoading}>Create Account</LoadingSwap>
          </Button>
        </div>
      </form>
    </Form>
  );
}
