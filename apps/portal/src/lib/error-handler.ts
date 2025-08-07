"use server";

import redis from "@ziron/redis";

import { createLog } from "@/lib/utils";

const log = createLog("Error Handler");

// Error types for better categorization
export type ErrorType = "validation" | "invitation" | "server" | "network" | "rate_limit";

// Error severity levels
export type ErrorSeverity = "low" | "medium" | "high" | "critical";

// Error information structure
export interface ErrorInfo {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  details?: string;
  status?: number;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

// Redis key prefix for error storage
const ERROR_KEY_PREFIX = "error:";
// TTL for error records (1 hour in seconds)
const ERROR_TTL = 60 * 60;

// Generate a secure error ID
function generateErrorId(): string {
  // Use cryptographically secure random values
  const randomBytes = new Uint8Array(6); // 6 bytes for 9 characters in base36
  crypto.getRandomValues(randomBytes);

  // Convert to base36 string and ensure it's exactly 9 characters
  const randomString = Array.from(randomBytes)
    .map((byte) => byte.toString(36).padStart(2, "0"))
    .join("")
    .substring(0, 9);

  return `err_${Date.now()}_${randomString}`;
}

// Store error information securely in Redis with TTL
export async function storeError(
  type: ErrorType,
  message: string,
  details?: string,
  status?: number,
  severity: ErrorSeverity = "medium",
  userAgent?: string,
  ip?: string
): Promise<string> {
  const errorId = generateErrorId();
  const errorInfo: ErrorInfo = {
    id: errorId,
    type,
    severity,
    message,
    details,
    status,
    timestamp: new Date(),
    userAgent,
    ip,
  };

  const redisKey = `${ERROR_KEY_PREFIX}${errorId}`;

  try {
    // Store error info as JSON with TTL for automatic expiration
    await redis.setex(redisKey, ERROR_TTL, JSON.stringify(errorInfo));

    log.info("Stored error securely in Redis", {
      errorId,
      type,
      severity,
      hasDetails: !!details,
      ttl: ERROR_TTL,
    });

    return errorId;
  } catch (error) {
    log.error("Failed to store error in Redis", {
      errorId,
      type,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    // Fallback: return the error ID even if storage fails
    // In production, you might want to implement additional fallback mechanisms
    return errorId;
  }
}

// Retrieve error information by ID from Redis
export async function getErrorInfo(errorId: string): Promise<ErrorInfo | null> {
  const redisKey = `${ERROR_KEY_PREFIX}${errorId}`;

  try {
    const errorData = await redis.get(redisKey);

    if (errorData) {
      const errorInfo: ErrorInfo = JSON.parse(errorData);
      // Convert timestamp string back to Date object
      errorInfo.timestamp = new Date(errorInfo.timestamp);

      log.info("Retrieved error info from Redis", {
        errorId,
        type: errorInfo.type,
      });

      return errorInfo;
    }
    log.warn("Error info not found in Redis", { errorId });
    return null;
  } catch (error) {
    log.error("Failed to retrieve error from Redis", {
      errorId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
}

// Server action to get error information (for use in client components)
export async function getErrorInfoAction(errorId: string) {
  if (!errorId) {
    return null;
  }

  return await getErrorInfo(errorId);
}
