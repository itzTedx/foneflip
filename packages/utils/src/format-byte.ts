/**
 * Formats a file size in bytes to a human-readable string with appropriate units
 * @param bytes - The file size in bytes
 * @param decimals - Number of decimal places to show (default: 2)
 * @returns Formatted string with appropriate unit (B, KB, MB, GB)
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Ensure we don't go beyond our defined units
  if (i >= sizes.length) {
    return `${(bytes / Math.pow(k, sizes.length - 1)).toFixed(decimals)} ${sizes[sizes.length - 1]}`;
  }

  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`;
}
