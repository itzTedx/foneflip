import type { JSX, ReactNode } from "react";

import { cn } from "@ziron/utils";

import { IconLoader } from "../assets/icons";

/**
 * Displays either a loading indicator or its children based on the loading state.
 *
 * Renders its children when `isLoading` is false, or a loading icon (custom or default) when `isLoading` is true. Both are positioned to overlap, with visibility toggled according to the loading state.
 *
 * @param isLoading - Whether to show the loading indicator instead of the children
 * @param children - The content to display when not loading
 * @param className - Optional additional CSS classes for both content and loader containers
 * @param icon - Optional custom loading icon to display when loading
 */
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
        className={cn("col-start-1 col-end-2 row-start-1 row-end-2", isLoading ? "visible" : "invisible", className)}
      >
        {icon ? icon : <IconLoader className="animate-spin" />}
      </div>
    </div>
  );
}
