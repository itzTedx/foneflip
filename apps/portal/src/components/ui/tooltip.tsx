import { IconInfoCircle } from "@tabler/icons-react";

import { Badge } from "@ziron/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ziron/ui/tooltip";

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
  variant?: "default" | "success" | "secondary" | "destructive" | "outline";
}

export const TooltipBadge = ({ tooltip, children, asChild = false, variant }: Props) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge asChild={asChild} variant={variant}>
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
