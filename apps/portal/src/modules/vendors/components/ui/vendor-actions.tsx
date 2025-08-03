"use client";

import { useState, useTransition } from "react";

import { IconCheck, IconX } from "@tabler/icons-react";
import { toast } from "sonner";

import type { Vendor } from "@ziron/db/types";
import { Button } from "@ziron/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useForm, zodResolver } from "@ziron/ui/form";
import { LoadingSwap } from "@ziron/ui/loading-swap";
import { ResponsiveModal } from "@ziron/ui/responsive-modal";
import { Textarea } from "@ziron/ui/textarea";
import { z } from "@ziron/validators";

import { approveVendor, rejectVendor } from "../../actions/mutation";

export default function VendorActions({ vendor }: { vendor: Vendor }) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [isApprovePending, startApproveTransition] = useTransition();
  const [isRejectPending, startRejectTransition] = useTransition();

  if (vendor.status !== "pending_approval") return null;

  function handleApprove() {
    startApproveTransition(async () => {
      const res = await approveVendor({ vendorId: vendor.id });
      if (res && (!("error" in res) || !res.error)) {
        toast.success("Vendor approved");
        // Optionally refresh or redirect
      } else {
        const errMsg = res && "error" in res && typeof res.error === "string" ? res.error : "Failed to approve vendor";
        toast.error(errMsg);
      }
    });
  }

  function handleReject(reason: string) {
    startRejectTransition(async () => {
      const res = await rejectVendor({ vendorId: vendor.id, reason });
      if (res && (!("error" in res) || !res.error)) {
        toast.success("Vendor rejected");
        setRejectOpen(false);
        // Optionally refresh or redirect
      } else {
        const errMsg = res && "error" in res && typeof res.error === "string" ? res.error : "Failed to reject vendor";
        toast.error(errMsg);
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button disabled={isApprovePending} onClick={handleApprove} variant="default">
        <LoadingSwap className="flex items-center gap-1" isLoading={isApprovePending}>
          <IconCheck className="-ms-1 size-3.5" />
          Approve
        </LoadingSwap>
      </Button>
      <Button onClick={() => setRejectOpen(true)} variant="destructive">
        <IconX className="-ms-1 size-3.5" />
        Reject
      </Button>
      <RejectModal loading={isRejectPending} onOpenChange={setRejectOpen} onSubmit={handleReject} open={rejectOpen} />
    </div>
  );
}

const rejectionSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
});

function RejectModal({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (reason: string) => void;
  loading: boolean;
}) {
  const form = useForm({
    resolver: zodResolver(rejectionSchema),
    defaultValues: { reason: "" },
  });
  return (
    <ResponsiveModal
      closeModal={onOpenChange}
      description="Provide a reason for rejection."
      isOpen={open}
      title="Reject Vendor"
    >
      <Form {...form}>
        <form className="space-y-4 p-4" onSubmit={form.handleSubmit((data) => onSubmit(data.reason))}>
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter reason for rejection..." {...field} rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2">
            <Button disabled={loading} onClick={() => onOpenChange(false)} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={loading} type="submit" variant="destructive">
              <LoadingSwap isLoading={loading}>Reject Vendor</LoadingSwap>
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  );
}
