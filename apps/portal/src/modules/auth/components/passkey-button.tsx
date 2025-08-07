import { useTransition } from "react";

import { FingerprintIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@ziron/ui/button";
import { cn } from "@ziron/utils";

import { signIn } from "@/lib/auth/client";

interface PasskeyButtonProps {
  className?: string;
  isSubmitting?: boolean;
  setIsSubmitting?: (isSubmitting: boolean) => void;
  email?: string;
  onSuccess?: () => void;
}

export function PasskeyButton({ className, isSubmitting, setIsSubmitting, email, onSuccess }: PasskeyButtonProps) {
  const [isPending, startTransition] = useTransition();

  const signInPassKey = async () => {
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }

    startTransition(async () => {
      try {
        setIsSubmitting?.(true);
        await signIn.passkey({
          email,
          autoFill: true,
          fetchOptions: {
            onSuccess: () => {
              toast.success("Signed in with passkey");
              onSuccess?.();
            },
            onError: (ctx) => {
              toast.error(ctx.error.message || "Passkey authentication failed");
              if (ctx.error.status === 404) {
                toast.info("No passkey found for this email. Please sign up first.");
              }
            },
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Passkey authentication failed";
        toast.error(errorMessage);
      } finally {
        setIsSubmitting?.(false);
      }
    });
  };

  const isLoading = isSubmitting || isPending;

  return (
    <Button
      className={cn("w-full", className)}
      disabled={isLoading || !email}
      formNoValidate
      name="passkey"
      onClick={signInPassKey}
      value="true"
      variant="secondary"
    >
      <FingerprintIcon />
      Sign in with passkey
    </Button>
  );
}
