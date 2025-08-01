import { ReactNode } from "react";
import Image from "next/image";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid h-svh grid-cols-5 overflow-hidden">
      <div className="col-span-2 h-svh w-full p-3 text-background">
        <div className="relative flex h-full flex-col items-center justify-end overflow-hidden rounded-xl bg-muted p-9">
          {/* <div className="relative z-10 mx-auto flex h-fit items-center gap-2">
            <IconLogo />
            <LogoWordMark />
          </div> */}
          <p className="relative z-10 mt-2 max-w-[30ch] text-balance text-center font-light text-foreground text-lg">
            Join as a verified vendor and sell mobiles, accessories, and more.
          </p>

          <Image
            alt=""
            className="object-cover dark:hidden"
            fill
            quality={100}
            src="/images/onboarding-bg-light.webp"
          />
          <Image
            alt=""
            className="hidden object-cover dark:block"
            fill
            quality={100}
            src="/images/onboarding-bg-dark.webp"
          />
        </div>
      </div>
      <div className="col-span-3 h-svh w-full p-3">{children}</div>
    </main>
  );
}
