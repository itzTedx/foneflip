"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { IconPhone } from "@tabler/icons-react";
import { AlertCircle, Clock, Shield, XCircle } from "lucide-react";

import { Badge } from "@ziron/ui/badge";
import { Button } from "@ziron/ui/button";
import { Card, CardContent } from "@ziron/ui/card";

interface ErrorInfo {
  type: string;
  message: string;
  status?: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  suggestions: string[];
  canRetry: boolean;
}

type SearchParams = Promise<{ [key: string]: string | undefined }>;

export default function VerifyErrorPage({ searchParams }: { searchParams: SearchParams }) {
  const router = useRouter();
  const searchParam = use(searchParams);
  const errorType = searchParam.type;
  const errorMessage = searchParam.message;
  const errorStatus = searchParam.status;

  const handleRetry = () => {
    router.refresh();
  };

  const getErrorInfo = (): ErrorInfo => {
    switch (errorType) {
      case "validation":
        return {
          type: "validation",
          message: errorMessage || "Invalid token format",
          icon: <XCircle className="h-8 w-8 text-warn" />,
          title: "Invalid Verification Link",
          description:
            "The verification link you're trying to use is not properly formatted or is missing required information.",
          suggestions: [
            "Check that you copied the entire link from your email",
            "Make sure there are no extra spaces or characters in the URL",
            "Try clicking the link directly from your email instead of copying it",
            "Contact support if you continue to have issues",
          ],

          canRetry: false,
        };

      case "invitation":
        if (errorStatus === "404") {
          return {
            type: "expired",
            message: errorMessage || "Invalid or expired token",
            icon: <Clock className="h-8 w-8 text-destructive" />,
            title: "Invitation Expired",
            description:
              "This invitation link has expired or is no longer valid. Invitation links typically expire after 24 hours for security reasons.",
            suggestions: [
              "Check if you received a more recent invitation email",
              "Contact your administrator to request a new invitation",
              "Make sure you're using the most recent invitation link",
              "If you're an existing user, try logging in directly",
            ],

            canRetry: false,
          };
        }
        if (errorStatus === "409") {
          return {
            type: "used",
            message: errorMessage || "Invitation has already been used",
            icon: <Shield className="h-8 w-8 text-info" />,
            title: "Already Verified",
            description:
              "This invitation has already been used to verify your account. You may already have access to the system.",
            suggestions: [
              "Try logging in with your email and password",
              "If you forgot your password, use the password reset feature",
              "Contact support if you need help accessing your account",
              "Check if you're already signed in on another device",
            ],

            canRetry: false,
          };
        }
        if (errorStatus === "403") {
          return {
            type: "revoked",
            message: errorMessage || "Invitation has been revoked",
            icon: <AlertCircle className="h-8 w-8 text-destructive" />,
            title: "Invitation Revoked",
            description: "This invitation has been revoked by your administrator and is no longer valid.",
            suggestions: [
              "Contact your administrator to request a new invitation",
              "Check if there are any account restrictions in place",
              "Verify your email address is still authorized",
              "Contact support for assistance",
            ],

            canRetry: false,
          };
        }
        return {
          type: "invitation",
          message: errorMessage || "Invitation error",
          icon: <AlertCircle className="h-8 w-8 text-destructive" />,
          title: "Invitation Error",
          description:
            "There was an issue processing your invitation. This could be due to a temporary system problem or invalid invitation data.",
          suggestions: [
            "Try refreshing the page and clicking the link again",
            "Check if your invitation email is still valid",
            "Contact your administrator for assistance",
            "Try accessing the link from a different browser",
          ],

          canRetry: true,
        };

      case "network":
        return {
          type: "network",
          message: errorMessage || "Network connection error",
          icon: <AlertCircle className="h-8 w-8 text-warn" />,
          title: "Connection Error",
          description: "We're having trouble connecting to our servers. This is usually a temporary issue.",
          suggestions: [
            "Check your internet connection",
            "Try refreshing the page",
            "Wait a few minutes and try again",
            "Contact support if the problem persists",
          ],

          canRetry: true,
        };

      case "rate_limit":
        return {
          type: "rate_limit",
          message: errorMessage || "Too many verification attempts",
          icon: <Clock className="h-8 w-8 text-warn" />,
          title: "Too Many Attempts",
          description: "You've made too many verification attempts. Please wait before trying again.",
          suggestions: [
            "Wait 15 minutes before trying again",
            "Check if you're using the correct invitation link",
            "Contact support if you need immediate assistance",
            "Try from a different network if possible",
          ],

          canRetry: true,
        };

      case "server":
      default:
        return {
          type: "server",
          message: errorMessage || "An unexpected error occurred",
          icon: <AlertCircle className="h-8 w-8 text-destructive" />,
          title: "Server Error",
          description:
            "We encountered an unexpected error while processing your verification. Our team has been notified.",
          suggestions: [
            "Please try again in a few moments",
            "Check your internet connection",
            "Contact support if the problem persists",
            "Try accessing the link from a different device",
          ],

          canRetry: true,
        };
    }
  };

  const errorInfo = getErrorInfo();

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <Card className="relative overflow-hidden sm:mx-auto sm:w-full sm:max-w-xl">
          {/* Background effects */}
          <div className="-top-1/2 -translate-y-[10%] absolute inset-x-0 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]">
            <div className="absolute top-0 right-0 left-0 m-auto h-[310px] w-[310px] rounded-full bg-brand-secondary opacity-20 blur-[100px]" />
          </div>

          <CardContent className="z-10 p-6 px-9">
            {/* Error Icon */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
              {errorInfo.icon}
            </div>

            {/* Header */}
            <h3 className="text-center font-semibold text-foreground text-lg">{errorInfo.title}</h3>
            <p className="mx-auto max-w-sm text-center text-muted-foreground text-sm">{errorInfo.description}</p>

            {/* Error Type and Severity */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {errorType && (
                <Badge className="text-xs capitalize" variant="secondary">
                  {errorType}
                </Badge>
              )}
            </div>

            {/* Suggestions */}
            <div className="mt-6 rounded-lg bg-muted/30 p-4">
              <h4 className="mb-2 font-medium text-foreground text-sm">What you can try:</h4>
              <ul className="space-y-1 text-muted-foreground text-sm">
                {errorInfo.suggestions.map((suggestion, index) => (
                  <li key={index}>• {suggestion}</li>
                ))}
              </ul>
            </div>

            {/* Error Details */}
            {errorMessage && (
              <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <p className="font-medium text-destructive text-sm">Error Details:</p>
                <p className="mt-1 text-destructive/80 text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {errorInfo.canRetry && (
                <Button className="w-full" onClick={handleRetry}>
                  Try Again
                </Button>
              )}

              <Button asChild className="w-full">
                <Link href="/">Return to Home</Link>
              </Button>

              <Button asChild className="w-full" variant="outline">
                <Link href="/contact">
                  <IconPhone className="mr-2 h-4 w-4" />
                  Contact Support
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
