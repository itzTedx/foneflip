import { useTransition } from "react";

import { FingerprintIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@ziron/ui/button";
import { cn } from "@ziron/utils";

import { authClient } from "@/lib/auth/client";

interface PasskeyRegisterButtonProps {
  className?: string;
  email?: string;
  name?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PasskeyRegisterButton({ className, email, name, onSuccess, onError }: PasskeyRegisterButtonProps) {
  const [isPending, startTransition] = useTransition();

  const registerPasskey = async () => {
    if (!email || !name) {
      toast.error("Please enter your email and name first");
      return;
    }

    startTransition(async () => {
      try {
        await authClient.passkey.addPasskey({
          fetchOptions: {
            onSuccess: () => {
              toast.success("Passkey registered successfully!");
              onSuccess?.();
            },
            onError: (ctx) => {
              const errorMessage = ctx.error.message || "Failed to register passkey";
              toast.error(errorMessage);
              onError?.(errorMessage);
            },
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to register passkey";
        toast.error(errorMessage);
        onError?.(errorMessage);
      }
    });
  };

  return (
    <Button
      className={cn("w-full", className)}
      disabled={isPending || !email || !name}
      formNoValidate
      name="passkey-register"
      onClick={registerPasskey}
      value="true"
      variant="secondary"
    >
      <FingerprintIcon />
      Register with passkey
    </Button>
  );
}
