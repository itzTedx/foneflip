import { IconInfoCircle } from "@tabler/icons-react";

import { Badge } from "@ziron/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ziron/ui/tooltip";
import { cn } from "@ziron/utils";

export const InfoTooltip = ({ info }: { info: React.ReactNode }) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <IconInfoCircle className="size-2 text-muted-foreground md:size-3" />
      </TooltipTrigger>
      <TooltipContent>{info}</TooltipContent>
    </Tooltip>
  );
};

interface Props {
  tooltip: string;
  children: React.ReactNode;
  asChild?: boolean;
  variant?: "default" | "success" | "secondary" | "destructive" | "outline" | "warn";
  className?: string;
}

export const TooltipBadge = ({ tooltip, children, asChild = false, variant, className }: Props) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge asChild={asChild} className={cn("capitalize", className)} variant={variant}>
          {children}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="capitalize">{tooltip}</TooltipContent>
    </Tooltip>
  );
};

export const SimpleTooltip = ({ tooltip, children, asChild = false }: Props) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
      <TooltipContent className="capitalize">{tooltip}</TooltipContent>
    </Tooltip>
  );
};
