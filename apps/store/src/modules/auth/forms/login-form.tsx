"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@ziron/ui/button";
import { Input, PasswordInput } from "@ziron/ui/input";
import { Label } from "@ziron/ui/label";
import { LoadingSwap } from "@ziron/ui/loading-swap";

import { signIn } from "@/lib/auth/client";

// import { PasskeyButton } from "./passkey-button";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  async function loginWithEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      await signIn.email({
        email,
        password,
        callbackURL: "/",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed in...");
            router.push("/");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
            if (ctx.error.status === 403) {
              toast.info("Please verify your email address");
            }
          },
        },
      });
    });
  }

  return (
    <form className="mt-9" onSubmit={loginWithEmail}>
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            autoComplete="email webauthn"
            id="email"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@mail.com"
            required
            type="email"
            value={email}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Password</Label>
          <PasswordInput onChange={(e) => setPassword(e.target.value)} required value={password} />
        </div>

        <Button className="w-full" disabled={isPending} type="submit">
          <LoadingSwap isLoading={isPending}>Login</LoadingSwap>
        </Button>

        {/* <PasskeyButton
          email={email}
          onSuccess={() => {
            toast.success("Signed in...");
            router.push("/");
          }}
        /> */}
      </div>
    </form>
  );
}
