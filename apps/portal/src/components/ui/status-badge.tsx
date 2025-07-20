import { IconArchive, IconCheck, IconPencil } from "@tabler/icons-react";

import { Badge } from "@ziron/ui/components/badge";

interface Props {
  status?: "active" | "draft" | "archived" | null;
}

export const StatusBadge = ({ status }: Props) => {
  return (
    <Badge
      className="gap-0.5"
      variant={
        status === "active"
          ? "success"
          : status === "draft"
            ? "secondary"
            : "destructive"
      }
    >
      <div>
        {status === "active" && <IconCheck className="size-3" />}
        {status === "draft" && <IconPencil className="size-3" />}
        {status === "archived" && <IconArchive className="size-3" />}
      </div>
      <span className="capitalize">{status}</span>
    </Badge>
  );
};
