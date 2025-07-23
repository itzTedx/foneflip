import { z } from "zod/v4";

export const mediaSchema = z.object({
  image: z
    .array(z.custom<File>())
    .min(1, "Please select at least one file")
    .max(1, "Please select up to 1 file")
    .refine((files) => files.every((file) => file.size <= 5 * 1024 * 1024), {
      message: "File size must be less than 5MB",
      path: ["image"],
    }),
});

export type MediaFormType = z.infer<typeof mediaSchema>;
