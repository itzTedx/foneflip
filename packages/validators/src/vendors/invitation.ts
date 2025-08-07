import { z } from "zod/v4";

export const expiresInEnum = z.enum(["1h", "24h", "48h"]);

export const invitationSchema = z.object({
  name: z.string().min(1),
  email: z.email().max(255),
  expiresIn: expiresInEnum.default("1h").optional(),
});

export type InviteFormType = z.infer<typeof invitationSchema>;

// Token validation schema
export const tokenValidationSchema = z.object({
  token: z.string().min(1),
});

export type TokenValidationType = z.infer<typeof tokenValidationSchema>;

// Accept invitation schema
export const acceptInvitationSchema = z.object({
  id: z.string().trim().min(1),
  token: z.string().trim().min(1),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().min(3).max(255),
  password: z.string().min(12).max(128),
  organizationName: z.string().trim().min(1).max(200),
  organizationSlug: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug must contain only lowercase letters, numbers, and hyphens",
    }),
});
export type AcceptInvitationType = z.infer<typeof acceptInvitationSchema>;
