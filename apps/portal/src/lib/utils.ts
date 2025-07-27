import { z } from "@ziron/validators";

/**
 * Generic form validation utility that accepts any Zod schema
 * @param data - The form data to validate
 * @param schema - The Zod schema to validate against
 * @returns The validation result from Zod's safeParse
 */
export const validateForm = <T extends z.ZodTypeAny>(
  data: z.infer<T>,
  schema: T,
) => {
  return schema.safeParse(data);
};

export function createLog(label: string = "App") {
  return {
    info: (...args: unknown[]) =>
      console.log(
        `%c[ℹ️] [${label}]`,
        "color: #1976d2; font-weight: bold;",
        ...args,
      ),
    success: (...args: unknown[]) =>
      console.log(
        `%c[✅] [${label}]`,
        "color: #388e3c; font-weight: bold;",
        ...args,
      ),
    warn: (...args: unknown[]) =>
      console.log(
        `%c[⚠️] [${label}]`,
        "color: #fbc02d; font-weight: bold;",
        ...args,
      ),
    error: (...args: unknown[]) =>
      console.error(
        `%c[❌] [${label}]`,
        "color: #d32f2f; font-weight: bold;",
        ...args,
      ),
  };
}

// Helper function to escape CSV values
export function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  const stringValue = String(value);
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

// Helper function to convert data to CSV format
export function convertToCsv(data: Record<string, unknown>[]): string {
  if (!data || data.length === 0) {
    return "";
  }
  const headers = Object.keys(data[0]!);
  const headerRow = headers.map((header) => escapeCsvValue(header)).join(",");
  const dataRows = data.map((row) =>
    headers.map((header) => escapeCsvValue(row[header])).join(","),
  );
  return [headerRow, ...dataRows].join("\n");
}

// Utility function to handle CSV file download
export function downloadCsv(
  data: string,
  filename: string = "collections-export.csv",
) {
  const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
