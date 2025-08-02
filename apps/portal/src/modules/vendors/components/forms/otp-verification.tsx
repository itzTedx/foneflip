"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@ziron/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
  zodResolver,
} from "@ziron/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@ziron/ui/input-otp";
import { LoadingSwap } from "@ziron/ui/loading-swap";
import { toast } from "@ziron/ui/sonner";
import { z } from "@ziron/validators";

import { resendEmailOTPAction, verifyEmailOTPAction } from "@/modules/auth/actions/mutations";

const otpSchema = z.object({
  otp: z.string().length(6, {
    message: "Your one-time password must be exactly 6 characters.",
  }),
});
interface Props {
  email: string;
}

export function OtpVerificationForm({ email }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  function onSubmit(data: z.infer<typeof otpSchema>) {
    startTransition(async () => {
      const result = await verifyEmailOTPAction({
        email,
        otp: data.otp,
      });

      if (result.error) {
        // Check if OTP is expired and show resend option
        const isExpired =
          result.error.includes("expired") || result.error.includes("OTP_EXPIRED") || result.code === "OTP_EXPIRED";
        if (isExpired) {
          setShowResendOption(true);
          toast.error("OTP has expired. Please request a new one.");
        } else {
          toast.error(result.error);
        }
      } else {
        toast.success("Email Verified");
        router.push(`/onboarding/organization?userId=${result.data?.userId}`);
      }
    });
  }

  async function handleResendOTP() {
    setIsResending(true);
    try {
      const result = await resendEmailOTPAction({ email });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("New OTP sent to your email");
        setShowResendOption(false);
        form.reset(); // Clear the form
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? `Failed to resend OTP: ${error.message}` : "Failed to resend OTP. Please try again.";
      toast.error(errorMessage);
      console.error("Resend OTP error:", error);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <Form {...form}>
      <form className="mt-8 flex w-full flex-col items-center space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">One-Time Password</FormLabel>
              <FormControl className="space-y-2">
                <div className="flex flex-col items-center">
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </FormControl>
              <FormDescription>Please enter the one-time password sent to your email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" disabled={isPending} type="submit">
          <LoadingSwap isLoading={isPending}>Continue</LoadingSwap>
        </Button>

        {showResendOption && (
          <div className="w-full space-y-2">
            <p className="text-center text-muted-foreground text-sm">Didn't receive the code or it expired?</p>
            <Button className="w-full" disabled={isResending} onClick={handleResendOTP} type="button" variant="outline">
              <LoadingSwap isLoading={isResending}>{isResending ? "Sending..." : "Resend OTP"}</LoadingSwap>
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
