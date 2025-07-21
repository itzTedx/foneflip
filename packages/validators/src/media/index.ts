import { z } from "zod/v4";

export const mediaSchema = z.object({
  url: z.url({ message: "Please provide a valid URL." }),
  fileName: z.string({ message: "File name must be a string." }).nullish(),
  fileSize: z.number({ message: "File size must be a number." }).nullish(),
  alt: z.string({ message: "Alt text must be a string." }).optional(),
  width: z.number({ message: "Width must be a number." }).nullish(),
  height: z.number({ message: "Height must be a number." }).nullish(),
  blurData: z.string({ message: "Blur data must be a string." }).nullish(),
});
