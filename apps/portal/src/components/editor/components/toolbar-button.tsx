import * as React from "react";

import { Toggle } from "@ziron/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ziron/ui/tooltip";
import { cn } from "@ziron/utils";

interface ToolbarButtonProps extends React.ComponentProps<typeof Toggle> {
  isActive?: boolean;
  tooltip?: string;
  tooltipOptions?: React.ComponentProps<typeof TooltipContent>;
}

export const ToolbarButton = ({
  isActive,
  children,
  tooltip,
  className,
  tooltipOptions,
  ...props
}: ToolbarButtonProps) => {
  const toggleButton = (
    <Toggle className={cn({ "bg-accent": isActive }, className)} {...props}>
      {children}
    </Toggle>
  );

  if (!tooltip) {
    return toggleButton;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{toggleButton}</TooltipTrigger>
      <TooltipContent {...tooltipOptions}>
        <div className="flex flex-col items-center text-center">{tooltip}</div>
      </TooltipContent>
    </Tooltip>
  );
};

ToolbarButton.displayName = "ToolbarButton";

export default ToolbarButton;
