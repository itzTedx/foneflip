import { IconInfoCircle } from "@tabler/icons-react";

import { Badge } from "@ziron/ui/components/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@ziron/ui/components/tooltip";

export const InfoTooltip = ({ info }: { info: string }) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <IconInfoCircle className="text-muted-foreground size-2 md:size-3" />
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

export const TooltipBadge = ({
  tooltip,
  children,
  asChild = false,
  variant,
}: Props) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={variant} asChild={asChild}>
          {children}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="capitalize">{tooltip}</TooltipContent>
    </Tooltip>
  );
};
