import * as React from "react";

import { IconLink } from "@tabler/icons-react";
import { CopyIcon, ExternalLinkIcon } from "lucide-react";

import { Separator } from "@ziron/ui/separator";

import { ToolbarButton } from "../toolbar-button";

interface LinkPopoverBlockProps {
  url: string;
  onClear: () => void;
  onEdit: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const LinkPopoverBlock: React.FC<LinkPopoverBlockProps> = ({ url, onClear, onEdit }) => {
  const [copyTitle, setCopyTitle] = React.useState<string>("Copy");

  const handleCopy = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setCopyTitle("Copied!");
          setTimeout(() => setCopyTitle("Copy"), 1000);
        })
        .catch(console.error);
    },
    [url]
  );

  const handleOpenLink = React.useCallback(() => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, [url]);

  return (
    <div className="flex overflow-hidden rounded bg-background p-2 shadow-lg">
      <div className="inline-flex items-center gap-1">
        <ToolbarButton onClick={onEdit} tooltip="Edit link">
          Edit link
        </ToolbarButton>
        <Separator orientation="vertical" />
        <ToolbarButton onClick={handleOpenLink} tooltip="Open link in a new tab">
          <ExternalLinkIcon />
        </ToolbarButton>
        <Separator orientation="vertical" />
        <ToolbarButton onClick={onClear} tooltip="Clear link">
          <IconLink />
        </ToolbarButton>
        <Separator orientation="vertical" />
        <ToolbarButton
          onClick={handleCopy}
          tooltip={copyTitle}
          tooltipOptions={{
            onPointerDownOutside: (e) => {
              if (e.target === e.currentTarget) e.preventDefault();
            },
          }}
        >
          <CopyIcon />
        </ToolbarButton>
      </div>
    </div>
  );
};
