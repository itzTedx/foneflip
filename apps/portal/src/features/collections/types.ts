import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import {
  collectionSettingsTable,
  collectionsTable,
  seoTable,
} from "@ziron/db/schema";

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

// Database types
export type Seo = InferSelectModel<typeof seoTable>;

export type Collection = InferSelectModel<typeof collectionsTable>;
export type CollectionSettings = InferSelectModel<
  typeof collectionSettingsTable
>;
export type NewCollection = InferInsertModel<typeof collectionsTable>;

// Query result types
export type CollectionQueryResult =
  | (Collection & {
      settings?: CollectionSettings;
      seo?: Seo;
    })
  | undefined;
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
