import { z } from "zod/v4";

export const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  mobile: z.string().min(7, "Mobile number must be at least 7 characters"),
  whatsapp: z.string().optional(),
  position: z.string().min(2, "Position must be at least 2 characters"),
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
