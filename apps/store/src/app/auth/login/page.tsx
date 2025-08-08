import Link from "next/link";
import { redirect } from "next/navigation";

import { IconBrandGoogle } from "@ziron/ui/assets/icons";
import { Button } from "@ziron/ui/button";
import { Separator } from "@ziron/ui/separator";

import { getSession } from "@/lib/auth/server";
import { LoginForm } from "@/modules/auth/forms/login-form";

export default async function LoginPage() {
  const session = await getSession();

  if (session) redirect("/");

  return (
    <div className="grid h-full grid-cols-2 gap-3">
      <div className="rounded-3xl bg-primary">
        <div className="h-full w-full" />
      </div>
      <div className="m-auto max-w-sm py-20">
        <div className="mb-4">
          <h1 className="font-bold text-2xl">Welcome back!</h1>
          <p className="text-muted-foreground text-sm">Enter your email to sign in to your account</p>
        </div>
        <Button className="w-full" size="lg" variant="outline">
          <IconBrandGoogle /> Continue with Google
        </Button>
        <div className="my-6 flex items-center gap-2">
          <Separator className="flex-1" />
          or
          <Separator className="flex-1" />
        </div>
        <LoginForm />
        <p className="my-4 text-muted-foreground text-sm">
          Don't have an account?{" "}
          <Link className="text-primary hover:underline" href="/auth/register">
            Register
          </Link>
        </p>
        <Separator />
        <p className="mt-6 text-pretty text-muted-foreground text-sm">
          By continuing, you agree to our Terms of Service and Privacy Policy. And is subject to google's terms of
          service and privacy policy.
        </p>
      </div>
    </div>
  );
}
