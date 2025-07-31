import { z } from "zod/v4";

export const mediaSchema = z.object({
  id: z.string().optional(),
  file: z
    .object({
      url: z.url({ message: "Please provide a valid URL." }),
      name: z.string({ message: "File name must be a string." }).nullish(),
      size: z.number({ message: "File size must be a number." }).nullish(),
      key: z.string("Failed to upload image").optional(),
    })
    .optional(),
  metadata: z
    .object({
      width: z.number({ message: "Width must be a number." }).nullish(),
      height: z.number({ message: "Height must be a number." }).nullish(),
      blurData: z.string({ message: "Blur data must be a string." }).nullish(),
    })
    .optional(),
  alt: z.string({ message: "Alt text must be a string." }).optional(),
  isPrimary: z.boolean().default(false),
});

export type MediaFormType = z.infer<typeof mediaSchema>;
