import { useEffect, useState, useTransition } from "react";

import { IconCopy, IconRefresh, IconX } from "@tabler/icons-react";
import { Row } from "@tanstack/react-table";
import { toast } from "sonner";

import { Button } from "@ziron/ui/button";

import { SimpleTooltip } from "@/components/ui/tooltip";
import { env } from "@/lib/env/client";

import { revokeInvitation, sendInvitation } from "../../actions/mutation";
import { InvitationType } from "../../types";

interface RowActionsProps {
  row: Row<InvitationType>;
  onResendInvite?: (data: { name: string; email: string; expiresIn: string }) => Promise<void>;
  onRevokeInvite?: (id: string) => Promise<void>;
}

export function RowActions({ row, onResendInvite, onRevokeInvite }: RowActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Extract data from the row
  const data = row.original;

  const onCopy = (token: string) => {
    // Construct the proper invitation URL
    const baseUrl = env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    const inviteUrl = `${baseUrl}/verify?token=${token}`;

    navigator.clipboard.writeText(inviteUrl);
    toast.success("Invitation URL copied to clipboard");
  };

  const handleResend = async () => {
    if (onResendInvite) {
      await onResendInvite({
        name: data.vendorName || "",
        email: data.vendorEmail,
        expiresIn: "24h",
      });
      return;
    }

    const result = await sendInvitation({
      name: data.vendorName || "",
      email: data.vendorEmail,
      expiresIn: "24h", // or use data.expiresIn if available/desired
    });

    if (result?.success && result.message) {
      toast.success(result.message);
    } else if (result?.message) {
      toast.error(result.message);
    } else {
      toast.error("Failed to resend invitation");
    }
  };

  const handleRevoke = async () => {
    if (!data.id) {
      toast.error("Invalid invitation ID");
      return;
    }

    if (onRevokeInvite) {
      await onRevokeInvite(data.id);
      return;
    }

    const result = await revokeInvitation(data.id);

    if (result?.success && result.message) {
      toast.success(result.message);
    } else if (result?.message) {
      toast.error(result.message);
    } else {
      toast.error("Failed to revoke invitation");
    }
  };

  const onResend = () => {
    if (!isMounted) return;
    startTransition(handleResend);
  };

  const onRevoke = () => {
    if (!isMounted) return;
    startTransition(handleRevoke);
  };

  return (
    <div className="ml-auto w-full space-x-2">
      <SimpleTooltip asChild tooltip="Copy invitation link">
        <Button
          disabled={data.status === "accepted" || data.status === "revoked"}
          onClick={() => onCopy(data.token)}
          size="btn"
          variant="outline"
        >
          <IconCopy />
        </Button>
      </SimpleTooltip>
      <SimpleTooltip asChild tooltip="Resend invitation">
        <Button
          disabled={isPending || data.status === "accepted" || data.status === "pending"}
          onClick={onResend}
          size="btn"
          variant="outline"
        >
          <IconRefresh />
        </Button>
      </SimpleTooltip>
      <SimpleTooltip asChild tooltip="Revoke">
        <Button
          disabled={isPending || data.status === "expired" || data.status === "accepted" || data.status === "revoked"}
          onClick={onRevoke}
          size="btn"
          variant="destructive"
        >
          <IconX />
        </Button>
      </SimpleTooltip>
    </div>
  );
}
