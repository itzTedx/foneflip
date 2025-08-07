export type ErrorType = "validation" | "invitation" | "server" | "network" | "rate_limit";

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
