import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main className="h-screen w-full overflow-hidden p-3">{children}</main>;
}
