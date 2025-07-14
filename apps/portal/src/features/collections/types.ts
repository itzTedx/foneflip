import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { collectionsTable } from "@ziron/db/schema";

// Database types
export type Collection = InferSelectModel<typeof collectionsTable>;
export type NewCollection = InferInsertModel<typeof collectionsTable>;

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
  performance: "Excellent" | "Good" | "Needs Improvement";
  recommendations: string[];
}

export interface CacheStats {
  totalKeys: number;
  memoryUsage: string;
}

// Query result types
export type CollectionQueryResult = Collection | undefined;
export type CollectionsQueryResult = Collection[];

// Cache key types
export type CacheKey = string;
export type CacheTTL = number;

// Utility types
export type CollectionIdentifier = {
  id?: string;
  slug?: string;
};

export type CacheOperation = "get" | "set" | "del" | "invalidate";

// Error types
export interface CacheError {
  operation: CacheOperation;
  key: string;
  error: string;
  timestamp: Date;
}
