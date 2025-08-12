import { Metadata } from "next";
import { redirect } from "next/navigation";

import { db } from "@ziron/db/server";
import { createMetadata } from "@ziron/seo";
import { IconLogoMono } from "@ziron/ui/assets/logo";
import { Card, CardContent } from "@ziron/ui/card";

import { getSession } from "@/lib/auth/server";
import { LoginForm } from "@/modules/auth/components/login-form";

export const generateMetadata = (): Metadata => {
  return createMetadata({
    title: "Login",
    description: "Login",
  });
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  const isFirstUser = await db.query.users.findFirst();

  if (!isFirstUser) redirect("/register");

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <Card className="relative overflow-hidden sm:mx-auto sm:w-full sm:max-w-md">
          {/* Background effects */}
          <div className="-top-1/2 -translate-y-[10%] absolute inset-x-0 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]">
            <div className="absolute top-0 right-0 left-0 m-auto h-[310px] w-[310px] rounded-full bg-brand-secondary opacity-20 blur-[100px]" />
          </div>

          <CardContent className="z-10 p-6 px-9">
            {/* Logo */}
            <div className="mx-auto grid size-14 place-content-center rounded-full border-background border-t bg-gradient-to-tr from-primary to-brand-secondary shadow-lg shadow-primary/30 dark:border-foreground/60">
              <IconLogoMono aria-hidden={true} className="size-9 text-white" />
            </div>

            {/* Header */}
            <h3 className="mt-6 text-center font-semibold text-foreground text-lg">Welcome back</h3>
            <p className="text-center text-muted-foreground text-sm">Enter your email to sign in to your account</p>

            {/* Login Form */}
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
