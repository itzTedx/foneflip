import { Badge } from "@ziron/ui/badge";
import { cn } from "@ziron/utils";

type PageHeaderProps = {
  title: string;
  children?: React.ReactNode;
  className?: string;
  badge?: React.ReactNode;
};

/**
 * Renders a styled, sticky page header with a title, optional badge, and optional right-aligned content.
 *
 * Displays the main header text with an optional badge next to it, and allows additional elements to be shown on the right side. Includes decorative gradient overlays on the left and right edges.
 *
 * @param title - The main header text to display
 * @param badge - Optional content to display inside a badge next to the title
 * @param children - Optional elements to display on the right side of the header
 * @param className - Optional additional CSS classes for the header container
 */
export function PageHeader({ title, children, className, badge }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-[calc(3rem+1px)] z-50 flex items-center justify-between bg-background/80 px-4 py-3 backdrop-blur-2xl md:px-6",
        className
      )}
    >
      <div className="flex items-center justify-center gap-2">
        <h1 className="font-medium text-2xl leading-none">{title}</h1>
        {badge && (
          <Badge className="capitalize" variant="outline">
            {badge}
          </Badge>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
      <div className="-z-10 absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent" />
      <div className="-z-10 absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
