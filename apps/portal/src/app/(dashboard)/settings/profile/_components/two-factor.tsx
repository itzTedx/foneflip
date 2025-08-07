"use client";

import { useState, useTransition } from "react";

import { IconLock } from "@tabler/icons-react";
import { QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";

import { Button } from "@ziron/ui/button";
import { CopyButton } from "@ziron/ui/copy-button";
import { Input } from "@ziron/ui/input";
import { Label, LabelAsterisk } from "@ziron/ui/label";
import { LoadingSwap } from "@ziron/ui/loading-swap";
import { ResponsiveModal } from "@ziron/ui/responsive-modal";
import { Separator } from "@ziron/ui/separator";
import { Switch } from "@ziron/ui/switch";

import { PasswordInput } from "@/components/ui/password-input";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth/client";

interface Props {
  value: boolean;
  onCheckedChange: (checked: boolean) => void;
  isTwoFactorEnabled?: boolean | null;
}

export const TwoFactor = ({
  value,
  onCheckedChange,
  isTwoFactorEnabled = false,
  ...props
}: Props & Omit<React.ComponentProps<typeof Switch>, "value" | "onCheckedChange">) => {
  const [isPending, startTransition] = useTransition();
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
  const [twoFaPassword, setTwoFaPassword] = useState<string>("");
  const [twoFactorVerifyURI, setTwoFactorVerifyURI] = useState<string>("");
  const [operationCompleted, setOperationCompleted] = useState(false);
  const [intendedState, setIntendedState] = useState<boolean | null>(null);

  const handleModalClose = () => {
    setIsTwoFactorModalOpen(false);
    setTwoFaPassword("");
    setTwoFactorVerifyURI("");

    // If the operation wasn't completed, revert the switch state
    if (!operationCompleted && intendedState !== null) {
      onCheckedChange(!intendedState);
    }

    setOperationCompleted(false);
    setIntendedState(null);
  };

  const handleEnableTwoFactor = async () => {
    if (twoFaPassword.length < 8 && !twoFactorVerifyURI) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    startTransition(async () => {
      if (isTwoFactorEnabled) {
        await authClient.twoFactor.disable({
          password: twoFaPassword,
          fetchOptions: {
            onError(context) {
              toast.error(context.error.message);
            },
            onSuccess() {
              toast("2FA disabled successfully");
              setOperationCompleted(true);
              onCheckedChange(false);
              setIsTwoFactorModalOpen(false);
            },
          },
        });
      } else {
        if (twoFactorVerifyURI) {
          await authClient.twoFactor.verifyTotp({
            code: twoFaPassword,
            fetchOptions: {
              onError(context) {
                setTwoFaPassword("");
                toast.error(context.error.message);
              },
              onSuccess() {
                toast("2FA enabled successfully");
                setTwoFactorVerifyURI("");
                setTwoFaPassword("");
                setOperationCompleted(true);
                onCheckedChange(true);
                setIsTwoFactorModalOpen(false);
              },
            },
          });
          return;
        }
        await authClient.twoFactor.enable({
          password: twoFaPassword,
          fetchOptions: {
            onError(context) {
              toast.error(context.error.message);
            },
            onSuccess(ctx) {
              setTwoFactorVerifyURI(ctx.data.totpURI);
            },
          },
        });
      }

      setTwoFaPassword("");
    });
  };

  const handleShowQRCode = async () => {
    if (twoFaPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    startTransition(async () => {
      await authClient.twoFactor.getTotpUri(
        {
          password: twoFaPassword,
        },
        {
          onSuccess(context) {
            setTwoFactorVerifyURI(context.data.totpURI);
          },
        }
      );
      setTwoFaPassword("");
    });
  };

  return (
    <div className="flex items-center gap-4">
      {!!isTwoFactorEnabled && (
        <ResponsiveModal
          description="Scan the QR code with your TOTP app"
          dialogClassName="sm:max-w-sm"
          title="Scan QR Code"
          trigger={
            <Button className="gap-2" title="Scan QR Code" variant="outline">
              <QrCode size={16} />
              <span className="text-xs md:text-sm">Scan QR Code</span>
            </Button>
          }
        >
          {twoFactorVerifyURI ? (
            <>
              <div className="mx-auto flex w-fit items-center justify-center rounded-md bg-white p-4">
                <QRCode size={200} value={twoFactorVerifyURI} />
              </div>
              <div className="mt-3 flex items-center justify-center">
                <CopyButton textToCopy={twoFactorVerifyURI} />
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Label>
                Enter Password <LabelAsterisk />
              </Label>
              <PasswordInput
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTwoFaPassword(e.target.value)}
                placeholder="Enter Password"
                value={twoFaPassword}
              />
              <Button className="mt-4" onClick={handleShowQRCode}>
                <LoadingSwap isLoading={isPending}>Show QR Code</LoadingSwap>
              </Button>
            </div>
          )}
        </ResponsiveModal>
      )}

      <SimpleTooltip
        asChild
        tooltip={isTwoFactorEnabled ? "Disable Two Factor Authentication" : "Enable Two Factor Authentication"}
      >
        <span>
          <Switch
            checked={value}
            onCheckedChange={(checked) => {
              setIntendedState(checked);
              setIsTwoFactorModalOpen(true);
            }}
            {...props}
          />
        </span>
      </SimpleTooltip>

      <ResponsiveModal
        closeModal={handleModalClose}
        description={
          isTwoFactorEnabled
            ? "Disable the second factor authentication from your account"
            : "Enable two-factor authentication to secure your account"
        }
        icon={<IconLock />}
        isOpen={isTwoFactorModalOpen}
        title={isTwoFactorEnabled ? "Disable Two Factor Authentication" : "Enable Two Factor Authentication"}
      >
        {twoFactorVerifyURI ? (
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-center text-muted-foreground text-sm">
                Use an authenticator app to <br />
                complete this process
              </p>
              <div className="mx-auto flex w-fit items-center justify-center rounded-lg bg-white p-4">
                <QRCode size={200} value={twoFactorVerifyURI} />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="password">Enter 6-digit code</Label>
              <p className="text-muted-foreground text-sm">
                After scanning QR code, the app will generate a 6-digit code.
              </p>
              <Input
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTwoFaPassword(e.target.value)}
                placeholder="Enter OTP"
                value={twoFaPassword}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTwoFaPassword(e.target.value)}
              placeholder="Password"
              value={twoFaPassword}
            />
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button disabled={isPending} onClick={handleEnableTwoFactor} type="button">
            <LoadingSwap isLoading={isPending}>{isTwoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}</LoadingSwap>
          </Button>
        </div>
      </ResponsiveModal>
    </div>
  );
};
