"use client";

import { useTransition } from "react";
import { ExportButton } from "@/components/ui/action-buttons";
import { downloadCsv } from "@/lib/utils";
import { toast } from "sonner";

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
    <ExportButton
      onClick={handleExport}
      disabled={isPending}
      isLoading={isPending}
    />
  );
};
