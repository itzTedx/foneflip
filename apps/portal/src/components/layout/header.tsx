import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@ziron/ui/components/tooltip";

interface CollectionHeaderProps {
  title?: string;
  status?: "draft" | "active" | "archived";
  children?: React.ReactNode;
}

export function Header({ title, status, children }: CollectionHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "#fbbf24";
      case "active":
        return "#10b981";
      case "archived":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "Draft";
      case "active":
        return "Active";
      case "archived":
        return "Archived";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="bg-background/80 sticky top-[calc(3rem)] z-50 flex items-center justify-between px-6 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-center gap-2">
        <h1 className="text-xl leading-none font-medium sm:text-2xl">
          {title}
        </h1>
        {status && (
          <Tooltip>
            <TooltipTrigger>
              <div
                className="size-2 cursor-help rounded-full"
                style={{ backgroundColor: getStatusColor(status) }}
              />
            </TooltipTrigger>
            <TooltipContent>Status: {getStatusLabel(status)}</TooltipContent>
          </Tooltip>
        )}
      </div>
      {children && children}
    </div>
  );
}
