import { getSession } from "@/lib/auth/server";
import { LoginForm } from "@/modules/auth/components/login-form";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import { createMetadata } from "@ziron/seo";
import { IconLogoMono } from "@ziron/ui/assets/logo";
import { Card, CardContent } from "@ziron/ui/card";

export const generateMetadata = (): Metadata => {
  return createMetadata({
    title: "Login",
    description: "Login",
  });
};

export default async function LoginPage() {
  const session = await getSession();

  if (session) redirect("/");

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <Card className="relative overflow-hidden sm:mx-auto sm:w-full sm:max-w-md">
          {/* Background effects */}
          <div className="absolute inset-x-0 -top-1/2 h-full w-full -translate-y-[10%] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]">
            <div className="bg-brand-secondary absolute top-0 right-0 left-0 m-auto h-[310px] w-[310px] rounded-full opacity-20 blur-[100px]"></div>
          </div>

          <CardContent className="z-10 p-6 px-9">
            {/* Logo */}
            <div className="from-primary to-brand-secondary border-background dark:border-foreground/60 shadow-primary/30 mx-auto grid size-14 place-content-center rounded-full border-t bg-gradient-to-tr shadow-lg">
              <IconLogoMono className="size-9 text-white" aria-hidden={true} />
            </div>

            {/* Header */}
            <h3 className="text-foreground mt-6 text-center text-lg font-semibold">
              Welcome back
            </h3>
            <p className="text-muted-foreground text-center text-sm">
              Enter your email to sign in to your account
            </p>

            {/* Login Form */}
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
