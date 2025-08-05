"use client";

import React, { useState } from "react";

import { Loader2, QrCode, ShieldCheck, ShieldOff } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";

import { Button } from "@ziron/ui/button";
import { CopyButton } from "@ziron/ui/copy-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ziron/ui/dialog";
import { Input } from "@ziron/ui/input";
import { Label } from "@ziron/ui/label";

import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth/client";

interface TestTwoFAProps {
  session?: {
    user: {
      twoFactorEnabled: boolean;
    };
  } | null;
}

export const TestTwoFA = ({ session }: TestTwoFAProps) => {
  const [twoFactorVerifyURI, setTwoFactorVerifyURI] = useState<string>("");
  const [twoFaPassword, setTwoFaPassword] = useState<string>("");
  const [twoFactorDialog, setTwoFactorDialog] = useState<boolean>(false);
  const [isPendingTwoFa, setIsPendingTwoFa] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">Two Factor</p>
      <div className="flex gap-2">
        {!!session?.user.twoFactorEnabled && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2" variant="outline">
                <QrCode size={16} />
                <span className="text-xs md:text-sm">Scan QR Code</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-11/12 sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Scan QR Code</DialogTitle>
                <DialogDescription>Scan the QR code with your TOTP app</DialogDescription>
              </DialogHeader>

              {twoFactorVerifyURI ? (
                <>
                  <div className="flex items-center justify-center">
                    <QRCode value={twoFactorVerifyURI} />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-muted-foreground text-sm">Copy URI to clipboard</p>
                    <CopyButton textToCopy={twoFactorVerifyURI} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <PasswordInput
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTwoFaPassword(e.target.value)}
                    placeholder="Enter Password"
                    value={twoFaPassword}
                  />
                  <Button
                    onClick={async () => {
                      if (twoFaPassword.length < 8) {
                        toast.error("Password must be at least 8 characters");
                        return;
                      }
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
                    }}
                  >
                    Show QR Code
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
        <Dialog onOpenChange={setTwoFactorDialog} open={twoFactorDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2" variant={session?.user.twoFactorEnabled ? "destructive" : "outline"}>
              {session?.user.twoFactorEnabled ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
              <span className="text-xs md:text-sm">
                {session?.user.twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-11/12 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{session?.user.twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}</DialogTitle>
              <DialogDescription>
                {session?.user.twoFactorEnabled
                  ? "Disable the second factor authentication from your account"
                  : "Enable 2FA to secure your account"}
              </DialogDescription>
            </DialogHeader>

            {twoFactorVerifyURI ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-center">
                  <QRCode value={twoFactorVerifyURI} />
                </div>
                <Label htmlFor="password">Scan the QR code with your TOTP app</Label>
                <Input
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTwoFaPassword(e.target.value)}
                  placeholder="Enter OTP"
                  value={twoFaPassword}
                />
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
            <DialogFooter>
              <Button
                disabled={isPendingTwoFa}
                onClick={async () => {
                  if (twoFaPassword.length < 8 && !twoFactorVerifyURI) {
                    toast.error("Password must be at least 8 characters");
                    return;
                  }
                  setIsPendingTwoFa(true);
                  if (session?.user.twoFactorEnabled) {
                    const res = await authClient.twoFactor.disable({
                      //@ts-ignore
                      password: twoFaPassword,
                      fetchOptions: {
                        onError(context) {
                          toast.error(context.error.message);
                        },
                        onSuccess() {
                          toast("2FA disabled successfully");
                          setTwoFactorDialog(false);
                        },
                      },
                    });
                  } else {
                    if (twoFactorVerifyURI) {
                      await authClient.twoFactor.verifyTotp({
                        code: twoFaPassword,
                        fetchOptions: {
                          onError(context) {
                            setIsPendingTwoFa(false);
                            setTwoFaPassword("");
                            toast.error(context.error.message);
                          },
                          onSuccess() {
                            toast("2FA enabled successfully");
                            setTwoFactorVerifyURI("");
                            setIsPendingTwoFa(false);
                            setTwoFaPassword("");
                            setTwoFactorDialog(false);
                          },
                        },
                      });
                      return;
                    }
                    const res = await authClient.twoFactor.enable({
                      password: twoFaPassword,
                      fetchOptions: {
                        onError(context) {
                          toast.error(context.error.message);
                        },
                        onSuccess(ctx) {
                          setTwoFactorVerifyURI(ctx.data.totpURI);
                          // toast.success("2FA enabled successfully");
                          // setTwoFactorDialog(false);
                        },
                      },
                    });
                  }
                  setIsPendingTwoFa(false);
                  setTwoFaPassword("");
                }}
              >
                {isPendingTwoFa ? (
                  <Loader2 className="animate-spin" size={15} />
                ) : session?.user.twoFactorEnabled ? (
                  "Disable 2FA"
                ) : (
                  "Enable 2FA"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
