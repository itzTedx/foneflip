import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import {
  collectionMediaTable,
  collectionSettingsTable,
  collectionsTable,
  mediaTable,
  seoTable,
  users,
} from "@ziron/db/schema";

import { ProductQueryResult } from "../products/types";

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
export type Media = InferSelectModel<typeof mediaTable>;
export type User = InferSelectModel<typeof users>;

export type NewCollection = InferInsertModel<typeof collectionsTable>;
export type CollectionMetadata = Pick<Collection, "id" | "title" | "createdAt">;
export type Collection = InferSelectModel<typeof collectionsTable>;
export type CollectionSettings = InferSelectModel<
  typeof collectionSettingsTable
>;
export type CollectionMedia = InferSelectModel<typeof collectionMediaTable>;

// Query result types
export type CollectionQueryResult =
  | (Collection & {
      settings?: CollectionSettings;
      seo?: Seo | null;
      products?: ProductQueryResult[];
      collectionMedia: (CollectionMedia & {
        media: Media;
      })[];
    })
  | undefined;
export type CollectionsQueryResult = CollectionQueryResult[];
export type MediaQueryResult = Media & {
  user: User;
};

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
