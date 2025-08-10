import { z } from "zod";

// Define your API schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export const UpdateUserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  name: z.string().optional(),
});

export const DeleteUserSchema = z.object({
  id: z.string(),
});

// Export types
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type DeleteUser = z.infer<typeof DeleteUserSchema>;

// API Response types
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
});

export type ApiResponse = z.infer<typeof ApiResponseSchema>;
