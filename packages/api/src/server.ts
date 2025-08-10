import type { CreateUser, UpdateUser, User } from "./types";

// Mock database for demonstration - replace with your actual database
const users: User[] = [];

// Define the server procedures
export const userProcedures = {
  create: async (input: CreateUser): Promise<User> => {
    const user: User = {
      id: crypto.randomUUID(),
      email: input.email,
      name: input.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.push(user);
    return user;
  },

  get: async (input: { id: string }): Promise<User | null> => {
    const user = users.find((u) => u.id === input.id);
    return user || null;
  },

  list: async (input: { limit: number; offset: number }) => {
    const { limit, offset } = input;
    const paginatedUsers = users.slice(offset, offset + limit);
    return {
      users: paginatedUsers,
      total: users.length,
    };
  },

  update: async (input: UpdateUser): Promise<User> => {
    const userIndex = users.findIndex((u) => u.id === input.id);
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    const existingUser = users[userIndex]!;
    const updatedUser: User = {
      id: existingUser.id,
      email: input.email || existingUser.email,
      name: input.name !== undefined ? input.name : existingUser.name,
      createdAt: existingUser.createdAt,
      updatedAt: new Date(),
    };
    users[userIndex] = updatedUser;
    return updatedUser;
  },

  delete: async (input: { id: string }) => {
    const userIndex = users.findIndex((u) => u.id === input.id);
    if (userIndex === -1) {
      return { success: false };
    }

    users.splice(userIndex, 1);
    return { success: true };
  },
};

export const healthProcedures = {
  check: async () => {
    return {
      status: "ok" as const,
      timestamp: new Date(),
    };
  },
};

// Export all procedures
export const procedures = {
  user: userProcedures,
  health: healthProcedures,
};
