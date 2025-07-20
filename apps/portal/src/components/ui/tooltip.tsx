import { IconInfoCircle } from "@tabler/icons-react";

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
