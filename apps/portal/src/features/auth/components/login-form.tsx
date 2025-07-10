"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";

import { authClient } from "@ziron/auth/client";
import { Button } from "@ziron/ui/components/button";
import { Input } from "@ziron/ui/components/input";
import { Label } from "@ziron/ui/components/label";
import { LoadingSwap } from "@ziron/ui/components/loading-swap";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  async function loginWithEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      await authClient.signIn.email({
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
            id="email"
            type="email"
            placeholder="name@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Password</Label>
          <PasswordInput value={password} onChange={setPassword} required />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          <LoadingSwap isLoading={isPending}>Login</LoadingSwap>
        </Button>
      </div>
    </form>
  );
}
