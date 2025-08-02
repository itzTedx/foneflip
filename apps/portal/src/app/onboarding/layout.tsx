import { ReactNode } from "react";
import Image from "next/image";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative grid h-svh grid-cols-5 overflow-hidden">
      <div
        className="absolute inset-0 z-0 opacity-50"
        style={{
          backgroundImage: `
        radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.2) 1px, transparent 0),
        radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.18) 1px, transparent 0),
        radial-gradient(circle at 1px 1px, rgba(236, 72, 153, 0.15) 1px, transparent 0)
      `,
          backgroundSize: "20px 20px, 30px 30px, 25px 25px",
          backgroundPosition: "0 0, 10px 10px, 15px 5px",
        }}
      />

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
