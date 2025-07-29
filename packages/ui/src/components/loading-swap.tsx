import type { JSX, ReactNode } from "react";
import { Loader } from "lucide-react";

import { cn } from "@ziron/utils";

export function LoadingSwap({
  isLoading,
  children,
  className,
  icon,
}: {
  isLoading: boolean;
  children: ReactNode;
  className?: string;
  icon?: JSX.Element;
}) {
  return (
    <div className="grid grid-cols-1 items-center justify-items-center">
      <div
        className={cn(
          "col-start-1 col-end-2 row-start-1 row-end-2 w-full",
          isLoading ? "invisible" : "visible",
          className
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "col-start-1 col-end-2 row-start-1 row-end-2",
          isLoading ? "visible" : "invisible",
          className
        )}
      >
        {icon ? icon : <Loader className="animate-spin" />}
      </div>
    </div>
  );
}
