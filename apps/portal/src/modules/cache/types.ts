// Types for cache operations
export type CacheOperationType = "create" | "update" | "delete";

export interface CacheOperationResult {
  success: boolean;
  error?: string;
}
