"use client";

import { useTransition } from "react";
import { downloadCsv } from "@/lib/utils";
import { IconFileExport } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@ziron/ui/components/button";
import { LoadingSwap } from "@ziron/ui/components/loading-swap";

import { exportCollectionsToCsv } from "../actions/mutations";

export const ExportCsvButton = () => {
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      const res = await exportCollectionsToCsv();
      if (res.error) {
        toast.dismiss();
        toast.error(res.error || "Failed to export collections");
      }
      if (res.success) {
        toast.dismiss();
        downloadCsv(res.data, res.filename);
        toast.success(`Successfully export ${res.recordCount} collections`);
      }
    });
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={isPending}>
      <LoadingSwap isLoading={isPending} className="flex items-center gap-2">
        <IconFileExport />
        Export
      </LoadingSwap>
    </Button>
  );
};
