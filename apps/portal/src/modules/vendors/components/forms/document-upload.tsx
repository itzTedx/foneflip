"use client";

import { useCallback, useEffect, useTransition } from "react";

import { FileText, Upload, XIcon } from "lucide-react";

import { Button } from "@ziron/ui/button";
import { Card, CardContent } from "@ziron/ui/card";
import { useFormContext } from "@ziron/ui/form";
import { LoadingSwap } from "@ziron/ui/loading-swap";
import { DocumentsFormData } from "@ziron/validators";

import { useFileUpload } from "@/hooks/use-file-upload";
import { getSignedURL } from "@/modules/media/actions/mutations";
import { computeSHA256Client } from "@/modules/media/utils/compute-sha256-client";

interface Props {
  name: keyof DocumentsFormData;
  label: string;
  description?: string;
  accept?: string;
  maxSize?: number; // in bytes
}

export function DocumentUpload({
  name,
  label,
  description,
  accept = "application/pdf,image/*",
  maxSize = 10 * 1024 * 1024,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useFormContext<DocumentsFormData>();

  const [
    { files, isDragging },
    { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, removeFile, getInputProps },
  ] = useFileUpload({
    accept,
    maxSize,
    multiple: false,
  });

  const file = files[0];
  const currentValue = form.watch(name);

  const handleUpload = useCallback(async () => {
    if (!file) return;

    startTransition(async () => {
      try {
        const checksum = await computeSHA256Client(file.file as File);

        const signedUrl = await getSignedURL({
          file: {
            type: (file.file as File).type,
            size: (file.file as File).size,
            fileName: (file.file as File).name,
          },
          collection: "documents",
          checksum: checksum,
        });

        if (signedUrl.error !== undefined) {
          form.setError(name, { message: signedUrl.message });
          return;
        }

        if (signedUrl.success) {
          const url = signedUrl.success.url;

          const xhr = new XMLHttpRequest();
          xhr.open("PUT", url, true);
          xhr.setRequestHeader("Content-Type", (file.file as File).type);
          xhr.setRequestHeader("Content-Language", (file.file as File).size.toString());

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              form.clearErrors(name);
              form.setValue(name, {
                url: url.split("?")[0] ?? "",
                type: (file.file as File).type,
              });
            } else {
              form.setError(name, { message: "Upload failed" });
            }
          };

          xhr.onerror = (error) => {
            form.setError(name, { message: "Upload error" });
            console.error(error);
          };

          xhr.send(file.file as File);
        }
      } catch (error) {
        console.error("Error during upload:", error);
        form.setError(name, { message: "Upload failed" });
      }
    });
  }, [file, form, name]);

  const handleRemove = useCallback(() => {
    if (file) {
      removeFile(file.id);
    }
    form.setValue(name, undefined);
  }, [file, form, name, removeFile]);

  // Auto-upload when file is selected
  useEffect(() => {
    if (file && !currentValue) {
      handleUpload();
    }
  }, [file, currentValue, handleUpload]);

  return (
    <div className="space-y-4">
      <div>
        <label className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
        {description && <p className="mt-1 text-muted-foreground text-sm">{description}</p>}
      </div>

      <div className="space-y-4">
        {/* Upload Area */}
        {!currentValue && (
          <div
            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
            }`}
            onClick={openFileDialog}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex items-center justify-center rounded-full border p-2.5">
                <Upload className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Drag & drop your document here</p>
                <p className="text-muted-foreground text-xs">Or click to browse</p>
              </div>
            </div>
            <input {...getInputProps()} className="sr-only" />
          </div>
        )}

        {/* File Preview */}
        {file && !currentValue && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-lg border p-2">
                    <FileText className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-medium text-sm">{(file.file as File).name}</p>
                    <p className="text-muted-foreground text-xs">
                      {((file.file as File).size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button disabled={isPending} onClick={handleRemove} size="sm" variant="outline">
                    Remove
                  </Button>
                  <Button disabled={isPending} onClick={handleUpload} size="sm">
                    <LoadingSwap isLoading={isPending}>Upload</LoadingSwap>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Uploaded Document */}
        {currentValue && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-lg border p-2">
                    <FileText className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-medium text-sm">Document uploaded</p>
                    <p className="text-muted-foreground text-xs">{currentValue.type}</p>
                  </div>
                </div>
                <Button disabled={isPending} onClick={handleRemove} size="sm" variant="outline">
                  <XIcon className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
