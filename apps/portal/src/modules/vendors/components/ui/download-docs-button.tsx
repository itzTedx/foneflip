"use client";

import { useTransition } from "react";

import { IconDownload } from "@tabler/icons-react";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { toast } from "sonner";

import { Button } from "@ziron/ui/button";
import { LoadingSwap } from "@ziron/ui/loading-swap";

type DocumentFormat = "pdf" | "jpg" | "png";

interface Document {
  label: string;
  url?: string;
  format?: DocumentFormat;
}

interface Props {
  documents: Document[];
  filename: string | null;
}

interface DownloadResult {
  success: boolean;
  fileName: string;
  error?: Error;
  blob?: Blob;
}

export const DownloadDocumentsButton = ({ documents, filename }: Props) => {
  const [isPending, startTransition] = useTransition();

  const getFileExtension = (doc: Document): DocumentFormat => {
    if (doc.format) {
      return doc.format;
    }

    if (!doc.url) {
      return "pdf";
    }

    try {
      const cleanUrl = doc?.url?.split("?")[0]?.split("#")[0];
      const extension = cleanUrl?.split(".").pop()?.toLowerCase();

      if (extension === "jpeg") return "jpg";
      if (extension === "jpg" || extension === "png" || extension === "pdf") {
        return extension;
      }
    } catch {
      // Continue to default
    }

    return "pdf";
  };

  const downloadDocument = async (doc: Document): Promise<DownloadResult> => {
    if (!doc.url) {
      return {
        success: false,
        fileName: doc.label,
        error: new Error("No URL provided"),
      };
    }

    try {
      const response = await fetch(doc.url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const fileExtension = getFileExtension(doc);
      const fileName = `${doc.label}.${fileExtension}`;

      return { success: true, fileName, blob };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`Error downloading ${doc.label}:`, errorMessage);
      return {
        success: false,
        fileName: doc.label,
        error: error instanceof Error ? error : new Error(errorMessage),
      };
    }
  };

  const handleDownloadAll = async () => {
    const validDocuments = documents.filter((doc) => doc.url);

    if (validDocuments.length === 0) {
      toast.error("No documents available for download");
      return;
    }

    try {
      toast.loading("Preparing Files...");

      const zip = new JSZip();
      const downloadPromises = validDocuments.map(downloadDocument);
      const results = await Promise.allSettled(downloadPromises);

      const successfulDownloads: DownloadResult[] = [];
      const failedDownloads: DownloadResult[] = [];

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          const downloadResult = result.value;
          if (downloadResult.success && downloadResult.blob) {
            zip.file(downloadResult.fileName, downloadResult.blob);
            successfulDownloads.push(downloadResult);
          } else {
            failedDownloads.push(downloadResult);
          }
        } else {
          failedDownloads.push({
            success: false,
            fileName: "unknown",
            error: result.reason,
          });
        }
      });

      if (successfulDownloads.length === 0) {
        toast.error("Failed to download any documents");
        return;
      }

      if (failedDownloads.length > 0) {
        console.warn(`${failedDownloads.length} documents failed to download`);
      }

      toast.dismiss();

      const content = await zip.generateAsync({ type: "blob" });
      const downloadName = `${filename || "vendor"}_documents.zip`;

      saveAs(content, downloadName);
      toast.success(`Downloaded ${successfulDownloads.length} document(s)`);
    } catch (error) {
      console.error("Error creating zip file:", error);
      toast.error("Failed to create download file");
    }
  };

  return (
    <Button disabled={isPending} onClick={() => startTransition(handleDownloadAll)} size="sm" variant="outline">
      <LoadingSwap className="flex items-center gap-1" isLoading={isPending}>
        <IconDownload className="-ms-1 size-3" />
        Download all
      </LoadingSwap>
    </Button>
  );
};
