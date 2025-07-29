import { useCallback, useEffect, useState } from "react";

import { Upload } from "lucide-react";

import { Button } from "@ziron/ui/button";
import { FileUpload, FileUploadDropzone, FileUploadProps, FileUploadTrigger } from "@ziron/ui/file-upload";
import { useFieldArray, useFormContext } from "@ziron/ui/form";
import { ProductFormType } from "@ziron/validators";

import { getSignedURL } from "@/modules/media/actions/mutations";
import { computeSHA256 } from "@/modules/media/utils/compute-sha256";
import { getImageMetadata } from "@/modules/media/utils/get-image-data";

export const MediaUpload = () => {
  const form = useFormContext<ProductFormType>();
  const [files, setFiles] = useState<File[]>([]);
  const maxSizeMB = 4;
  const maxSize = maxSizeMB * 1024 * 1024; // 2MB default

  const { append, replace } = useFieldArray({
    control: form.control,
    name: "images",
  });

  useEffect(() => {
    files.forEach((image) =>
      append({
        file: {
          url: URL.createObjectURL(image),
          name: image.name,
          size: image.size,
        },
      })
    );
  }, [files]);

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
              collection: "product",
              checksum: checksum,
            });

            if (signedUrl.error !== undefined) {
              form.setError("images", new Error(signedUrl.message));
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
                  form.clearErrors("images");
                  const images = form.getValues("images") || [];

                  const updatedImages = images.map((img) => {
                    // If the url is a blob, try to find the uploaded image by fileName
                    if (img.file?.url && img.file?.url.startsWith("blob:")) {
                      if (file) {
                        return {
                          file: {
                            url: url.split("?")[0] ?? "",
                            name: file.name,
                            size: file.size,
                            key: key,
                          },
                          metadata: {
                            ...metadata,
                          },
                        };
                      }
                    }
                    return img;
                  });
                  replace(updatedImages);
                } else {
                  form.setError("images", new Error("Upload failed"));
                }
              };

              xhr.onerror = (error) => {
                form.setError("images", new Error("Upload error"));
                onError(file, error instanceof Error ? error : new Error("Upload failed"));
              };

              xhr.send(file);
              onSuccess(file);
            }
          } catch (error) {
            onError(file, error instanceof Error ? error : new Error("Upload failed"));
          }
        });

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Unexpected error during upload:", error);
      }
    },
    [form.clearErrors]
  );

  return (
    <FileUpload
      accept="image/*"
      maxFiles={10}
      maxSize={maxSize}
      multiple
      onFileReject={(_, message) => {
        form.setError("images", {
          message,
        });
      }}
      onUpload={onUpload}
      onValueChange={setFiles}
      value={files}
    >
      <FileUploadDropzone className="relative flex select-none flex-col items-center justify-center gap-2 rounded-lg border-dashed py-12 outline-none transition-colors hover:bg-accent/30 focus-visible:border-ring/50 data-[disabled]:pointer-events-none data-[dragging]:border-primary data-[invalid]:border-destructive data-[dragging]:bg-accent/30 data-[invalid]:ring-destructive/20">
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            <Upload className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm">Drag & drop image here</p>
          <p className="text-muted-foreground text-xs">Or click to browse</p>
        </div>
        <FileUploadTrigger asChild>
          <Button className="mt-2 w-fit" size="sm" variant="outline">
            Browse files
          </Button>
        </FileUploadTrigger>
        {/* <FileUploadList orientation="horizontal">
          {files.map((file, index) => {
            // console.log(file);
            return (
              <FileUploadItem className="p-0" key={index} value={file}>
                <FileUploadItemPreview className="size-20 [&>svg]:size-12">
                  <FileUploadItemProgress size={30} variant="circular" />
                </FileUploadItemPreview>

                <FileUploadItemDelete asChild>
                  <Button className="-top-1 -right-1 absolute size-5 rounded-full" size="icon" variant="secondary">
                    <IconX className="size-3" />
                  </Button>
                </FileUploadItemDelete>
              </FileUploadItem>
            );
          })}
        </FileUploadList> */}
      </FileUploadDropzone>
    </FileUpload>
  );
};
