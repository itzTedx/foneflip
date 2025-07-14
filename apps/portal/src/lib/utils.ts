import { z } from "zod/v4";

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
