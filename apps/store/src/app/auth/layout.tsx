import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main className="flex h-screen w-full flex-col overflow-hidden p-3">{children}</main>;
}
