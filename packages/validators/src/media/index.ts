import { z } from "zod/v4";

export const mediaSchema = z.object({
  url: z.url(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  blurData: z.string().optional(),
});
