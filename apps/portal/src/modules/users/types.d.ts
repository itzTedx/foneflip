import type { InferSelectModel } from "drizzle-orm";

import { users } from "@ziron/db/schema";

// Cache types
export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  averageResponseTime: number;
  cacheSize: number;
  memoryUsage: string;
}

export interface CacheInsights {
  performance: "good" | "fair" | "poor";
  recommendations: string[];
  issues: string[];
}

// Database types
export type User = InferSelectModel<typeof users>;

// Query result types
export type UsersQueryResult = User[];

// Cache key types
export type CacheKey = string;
export type CacheTTL = number;

// Utility types
export interface UserIdentifier {
  id?: string;
  email?: string;
}
export type CacheOperation = "get" | "set" | "del" | "invalidate";

// Error types
export interface CacheError {
  operation: CacheOperation;
  key: string;
  error: string;
  timestamp: Date;
}
