import { z } from "zod/v4";

// Schema for validating user registration data:
// - username: string (2-50 characters)
// - email: valid email address
// - password: string (min 4 characters)
export const registerUserSchema = z
  .object({
    username: z.string().min(2).max(50),
    email: z.email(),
    password: z.string().min(4),
  })
  .describe("Validates user registration data: username (2-50 chars), valid email, and password (min 4 chars).");
