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
