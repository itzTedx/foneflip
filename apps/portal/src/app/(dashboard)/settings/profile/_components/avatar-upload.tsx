import { useCallback, useState } from "react";
import { getSignedURL } from "@/features/media/actions/mutations";
import { computeSHA256 } from "@/features/media/utils/compute-sha256";
import { getImageMetadata } from "@/features/media/utils/get-image-data";
import { Upload } from "lucide-react";

import { Button } from "@ziron/ui/components/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadProps,
  FileUploadTrigger,
} from "@ziron/ui/components/file-upload";

interface Props {
  form: any;
}

export const AvatarUpload = ({ form }: Props) => {
  const [files, setFiles] = useState<File[]>([]);
  const maxSizeMB = 4;
  const maxSize = maxSizeMB * 1024 * 1024; // 2MB default

  const onUpload: NonNullable<FileUploadProps["onUpload"]> = useCallback(
    async (files, { onProgress, onSuccess, onError }) => {
      try {
        // Process each file individually

        const uploadPromises = files.map(async (file) => {
          try {
            const checksum = await computeSHA256(file);

            const signedUrl = await getSignedURL({
              file: {
                type: file.type,
                size: file.size,
                fileName: file.name,
              },

              checksum: checksum,
            });

            if (signedUrl.error !== undefined) {
              form.setError(name, new Error(signedUrl.message));
            }

            if (signedUrl.success) {
              const url = signedUrl.success.url;
              const key = signedUrl.success.key;

              // Get image metadata (blurData, width, height)
              const metadata = await getImageMetadata(file);

              const xhr = new XMLHttpRequest();
              xhr.open("PUT", url, true);
              xhr.setRequestHeader("Content-Type", file.type);
              xhr.setRequestHeader("Content-Language", file.size.toString());
              xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                  const progress = (event.loaded / event.total) * 100;
                  onProgress(file, progress);
                }
              };

              xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  form.clearErrors(name);
                  form.setValue(name, {
                    file: {
                      url: url.split("?")[0] ?? "",
                      name: file.name,
                      size: file.size,
                      key: key,
                    },
                    metadata: {
                      ...metadata,
                    },
                  });
                } else {
                  form.setError(name, new Error("Upload failed"));
                }
              };

              xhr.onerror = (error) => {
                form.setError(name, new Error("Upload error"));
                onError(
                  file,
                  error instanceof Error ? error : new Error("Upload failed"),
                );
              };

              xhr.send(file);
              onSuccess(file);
            }
          } catch (error) {
            onError(
              file,
              error instanceof Error ? error : new Error("Upload failed"),
            );
          }
        });

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Unexpected error during upload:", error);
      }
    },
    [],
  );
  return (
    <FileUpload
      value={files}
      onValueChange={setFiles}
      accept="image/*"
      maxFiles={1}
      maxSize={maxSize}
      onUpload={onUpload}
      onFileReject={(_, message) => {
        form.setError(name, {
          message,
        });
      }}
    >
      <FileUploadDropzone className="hover:bg-accent/30 focus-visible:border-ring/50 data-[dragging]:border-primary data-[invalid]:border-destructive data-[dragging]:bg-accent/30 data-[invalid]:ring-destructive/20 relative flex flex-col items-center justify-center gap-2 rounded-lg border-dashed py-12 transition-colors outline-none select-none data-[disabled]:pointer-events-none">
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            <Upload className="text-muted-foreground size-6" />
          </div>
          <p className="text-sm font-medium">Drag & drop image here</p>
          <p className="text-muted-foreground text-xs">Or click to browse</p>
        </div>
        <FileUploadTrigger asChild>
          <Button variant="outline" size="sm" className="mt-2 w-fit">
            Browse files
          </Button>
        </FileUploadTrigger>
      </FileUploadDropzone>
    </FileUpload>
  );
};
