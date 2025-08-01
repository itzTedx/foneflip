import { IconArchiveFilled, IconExclamationCircleFilled, IconRosetteDiscountCheckFilled } from "@tabler/icons-react";

import { IconFileEditFilled } from "@ziron/ui/assets/icons";
import { StatusBadge as Root, StatusBadgeIcon } from "@ziron/ui/status-badge";

interface Props {
  status?: "active" | "draft" | "archived" | null;
}

export const StatusBadge = ({ status }: Props) => {
  return (
    <Root
      className="capitalize"
      status={
        status === "active" ? "success" : status === "draft" ? "disabled" : status === "archived" ? "error" : "disabled"
      }
    >
      <StatusBadgeIcon
        as={
          status === "active"
            ? IconRosetteDiscountCheckFilled
            : status === "draft"
              ? IconFileEditFilled
              : status === "archived"
                ? IconArchiveFilled
                : IconExclamationCircleFilled
        }
      />

      {status}
    </Root>
  );
};
