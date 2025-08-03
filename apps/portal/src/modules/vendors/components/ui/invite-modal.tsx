"use client";

import { parseAsBoolean, useQueryState } from "nuqs";

import { IconVendors } from "@ziron/ui/assets/icons";
import { Button } from "@ziron/ui/button";
import { ResponsiveModal } from "@ziron/ui/responsive-modal";

import InviteForm from "../invitation-form";

export const InviteModal = () => {
  const [open, setOpen] = useQueryState("new", parseAsBoolean.withDefault(false));
  return (
    <ResponsiveModal
      closeModal={setOpen}
      description="Invite a new vendor to your account"
      icon={<IconVendors className="size-5 text-muted-foreground" />}
      isOpen={open}
      title="Invite Vendor"
      trigger={
        <Button onClick={() => setOpen(true)}>
          <IconVendors className="text-white" />
          Invite Vendor
        </Button>
      }
    >
      <InviteForm />
    </ResponsiveModal>
  );
};
