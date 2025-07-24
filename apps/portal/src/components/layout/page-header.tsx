import { Badge } from "@ziron/ui/components/badge";
import { cn } from "@ziron/utils";

type PageHeaderProps = {
  title: string;
  children?: React.ReactNode;
  className?: string;
  badge?: React.ReactNode;
};

export function PageHeader({
  title,
  children,
  className,
  badge,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "bg-background/80 sticky top-[calc(3rem)] z-50 flex items-center justify-between border-b px-4 py-3 backdrop-blur-2xl md:px-6",
        className,
      )}
    >
      <div className="flex items-center justify-center gap-2">
        <h1 className="text-2xl leading-none font-medium">{title}</h1>
        {badge && (
          <Badge variant="outline" className="capitalize">
            {badge}
          </Badge>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
      <div className="from-background absolute inset-y-0 left-0 -z-10 w-12 bg-gradient-to-r to-transparent" />
      <div className="from-background absolute inset-y-0 right-0 -z-10 w-12 bg-gradient-to-l to-transparent" />
    </div>
  );
}
