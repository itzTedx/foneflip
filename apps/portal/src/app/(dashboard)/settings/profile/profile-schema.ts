import { z } from "zod/v4";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().optional(),
  avatarUrl: z.string().optional(),
  twoFactorEnabled: z.boolean(),
});

export type ProfileFormType = z.infer<typeof profileSchema>;
