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
  id: z.string().min(1),
  token: z.string().min(1),
  name: z.string().min(1),
  email: z.email().max(255),
  password: z.string().min(8),
  organizationName: z.string().min(1),
  organizationSlug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug must contain only lowercase letters, numbers, and hyphens",
    }),
});

export type AcceptInvitationType = z.infer<typeof acceptInvitationSchema>;
