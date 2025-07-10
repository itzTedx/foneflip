import { z } from "zod/v4";

export const NotificationPayloadSchema = z.object({
  userId: z.uuid(),
  message: z.string().min(1),
  type: z.string().min(1),
});

export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;
