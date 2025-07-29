"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

export { toast } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      theme={theme as ToasterProps["theme"]}
      {...props}
    />
  );
};

export { Toaster };

// export const TOAST_ICONS = {
//   error: <CircleXmarkIcon className="size-4" />,
//   success: <CircleCheckIcon className="size-4" />,
//   warning: <TriangleWarningIcon className="size-4" />,
//   info: <LabelInfoIcon className="size-4" />,
// } satisfies ToasterProps["icons"];
