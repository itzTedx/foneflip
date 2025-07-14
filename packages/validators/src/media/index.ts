import { z } from "zod/v4";

export const mediaSchema = z.object({
  url: z.url({ message: "Please provide a valid URL." }),
  fileName: z.string({ message: "File name must be a string." }).optional(),
  fileSize: z.number({ message: "File size must be a number." }).optional(),
  alt: z.string({ message: "Alt text must be a string." }).optional(),
  width: z.number({ message: "Width must be a number." }).optional(),
  height: z.number({ message: "Height must be a number." }).optional(),
  blurData: z.string({ message: "Blur data must be a string." }).optional(),
});
