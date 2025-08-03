// Helper function to map MIME type to database format
export function mapMimeTypeToDbFormat(mimeType: string): "pdf" | "jpg" | "png" {
  const mimeToFormat: Record<string, "pdf" | "jpg" | "png"> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "application/pdf": "pdf",
  };

  return mimeToFormat[mimeType] || "pdf";
}
