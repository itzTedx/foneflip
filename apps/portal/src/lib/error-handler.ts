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
  "use server";

  if (!errorId) {
    return null;
  }

  return await getErrorInfo(errorId);
}

// Get user-friendly error messages based on type
export function getUserFriendlyMessage(type: ErrorType, status?: number): string {
  switch (type) {
    case "validation":
      return "The verification link format is invalid";
    case "invitation":
      if (status === 404) return "This invitation has expired or is invalid";
      if (status === 409) return "This invitation has already been used";
      if (status === 403) return "This invitation has been revoked";
      return "There was an issue with your invitation";
    case "server":
      return "We encountered an unexpected error";
    case "network":
      return "We're having trouble connecting to our servers";
    case "rate_limit":
      return "Too many verification attempts";
    default:
      return "An unexpected error occurred";
  }
}

// Get error suggestions based on type
export function getErrorSuggestions(type: ErrorType, status?: number): string[] {
  switch (type) {
    case "validation":
      return [
        "Check that you copied the entire link from your email",
        "Make sure there are no extra spaces or characters in the URL",
        "Try clicking the link directly from your email instead of copying it",
        "Contact support if you continue to have issues",
      ];
    case "invitation":
      if (status === 404) {
        return [
          "Check if you received a more recent invitation email",
          "Contact your administrator to request a new invitation",
          "Make sure you're using the most recent invitation link",
          "If you're an existing user, try logging in directly",
        ];
      }
      if (status === 409) {
        return [
          "Try logging in with your email and password",
          "If you forgot your password, use the password reset feature",
          "Contact support if you need help accessing your account",
          "Check if you're already signed in on another device",
        ];
      }
      if (status === 403) {
        return [
          "Contact your administrator to request a new invitation",
          "Check if there are any account restrictions in place",
          "Verify your email address is still authorized",
          "Contact support for assistance",
        ];
      }
      return [
        "Try refreshing the page and clicking the link again",
        "Check if your invitation email is still valid",
        "Contact your administrator for assistance",
        "Try accessing the link from a different browser",
      ];
    case "network":
      return [
        "Check your internet connection",
        "Try refreshing the page",
        "Wait a few minutes and try again",
        "Contact support if the problem persists",
      ];
    case "rate_limit":
      return [
        "Wait 15 minutes before trying again",
        "Check if you're using the correct invitation link",
        "Contact support if you need immediate assistance",
        "Try from a different network if possible",
      ];
    case "server":
    default:
      return [
        "Please try again in a few moments",
        "Check your internet connection",
        "Contact support if the problem persists",
        "Try accessing the link from a different device",
      ];
  }
}

// Get error icon and title based on type
export function getErrorDisplayInfo(
  type: ErrorType,
  status?: number
): {
  icon: string;
  title: string;
  canRetry: boolean;
} {
  switch (type) {
    case "validation":
      return {
        icon: "XCircle",
        title: "Invalid Verification Link",
        canRetry: false,
      };
    case "invitation":
      if (status === 404) {
        return {
          icon: "Clock",
          title: "Invitation Expired",
          canRetry: false,
        };
      }
      if (status === 409) {
        return {
          icon: "Shield",
          title: "Already Verified",
          canRetry: false,
        };
      }
      if (status === 403) {
        return {
          icon: "AlertCircle",
          title: "Invitation Revoked",
          canRetry: false,
        };
      }
      return {
        icon: "AlertCircle",
        title: "Invitation Error",
        canRetry: true,
      };
    case "network":
      return {
        icon: "AlertCircle",
        title: "Connection Error",
        canRetry: true,
      };
    case "rate_limit":
      return {
        icon: "Clock",
        title: "Too Many Attempts",
        canRetry: true,
      };
    case "server":
    default:
      return {
        icon: "AlertCircle",
        title: "Server Error",
        canRetry: true,
      };
  }
}
