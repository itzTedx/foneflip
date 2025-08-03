"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AlertCircle, Clock, Phone, Shield, XCircle } from "lucide-react";

import { Badge } from "@ziron/ui/badge";
import { Button } from "@ziron/ui/button";
import { Card, CardContent } from "@ziron/ui/card";

import {
  type ErrorType,
  getErrorDisplayInfo,
  getErrorInfoAction,
  getErrorSuggestions,
  getUserFriendlyMessage,
} from "@/lib/error-handler";

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
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorId, setErrorId] = useState<string | null>(null);

  useEffect(() => {
    const initializeErrorInfo = async () => {
      try {
        const params = await searchParams;
        const id = params.id;
        setErrorId(id || null);

        if (!id) {
          setErrorInfo({
            type: "server",
            message: "No error information available",
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
          });
          setIsLoading(false);
          return;
        }

        // Get error information from secure storage
        const errorData = await getErrorInfoAction(id);

        if (!errorData) {
          setErrorInfo({
            type: "server",
            message: "Error information not found",
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
          });
          setIsLoading(false);
          return;
        }

        // Get display information based on error type
        const displayInfo = getErrorDisplayInfo(errorData.type, errorData.status);
        const userFriendlyMessage = getUserFriendlyMessage(errorData.type, errorData.status);
        const suggestions = getErrorSuggestions(errorData.type, errorData.status);

        // Map icon string to component
        const getIconComponent = (iconName: string) => {
          switch (iconName) {
            case "XCircle":
              return <XCircle className="h-8 w-8 text-warn" />;
            case "Clock":
              return <Clock className="h-8 w-8 text-destructive" />;
            case "Shield":
              return <Shield className="h-8 w-8 text-info" />;
            case "AlertCircle":
            default:
              return <AlertCircle className="h-8 w-8 text-destructive" />;
          }
        };

        setErrorInfo({
          type: errorData.type,
          message: userFriendlyMessage,
          status: errorData.status?.toString(),
          icon: getIconComponent(displayInfo.icon),
          title: displayInfo.title,
          description: getErrorDescription(errorData.type, errorData.status),
          suggestions,
          canRetry: displayInfo.canRetry,
        });
      } catch (error) {
        console.error("Failed to load error information:", error);
        setErrorInfo({
          type: "server",
          message: "Failed to load error information",
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
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeErrorInfo();
  }, [searchParams]);

  const handleRetry = () => {
    router.refresh();
  };

  const getErrorDescription = (type: ErrorType, status?: number): string => {
    switch (type) {
      case "validation":
        return "The verification link you're trying to use is not properly formatted or is missing required information.";
      case "invitation":
        if (status === 404) {
          return "This invitation link has expired or is no longer valid. Invitation links typically expire after 24 hours for security reasons.";
        }
        if (status === 409) {
          return "This invitation has already been used to verify your account. You may already have access to the system.";
        }
        if (status === 403) {
          return "This invitation has been revoked by your administrator and is no longer valid.";
        }
        return "There was an issue processing your invitation. This could be due to a temporary system problem or invalid invitation data.";
      case "network":
        return "We're having trouble connecting to our servers. This is usually a temporary issue.";
      case "rate_limit":
        return "You've made too many verification attempts. Please wait before trying again.";
      case "server":
      default:
        return "We encountered an unexpected error while processing your verification. Our team has been notified.";
    }
  };

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
          <Card className="relative overflow-hidden sm:mx-auto sm:w-full sm:max-w-xl">
            <CardContent className="z-10 p-6 px-9">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                <AlertCircle className="h-8 w-8 animate-pulse text-muted-foreground" />
              </div>
              <h3 className="text-center font-semibold text-foreground text-lg">Loading...</h3>
              <p className="mx-auto max-w-sm text-center text-muted-foreground text-sm">
                Retrieving error information...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!errorInfo) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
          <Card className="relative overflow-hidden sm:mx-auto sm:w-full sm:max-w-xl">
            <CardContent className="z-10 p-6 px-9">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-center font-semibold text-foreground text-lg">Error</h3>
              <p className="mx-auto max-w-sm text-center text-muted-foreground text-sm">
                Failed to load error information.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              {errorInfo.type && (
                <Badge className="text-xs capitalize" variant="secondary">
                  {errorInfo.type}
                </Badge>
              )}
              {errorId && (
                <Badge className="text-xs" variant="outline">
                  ID: {errorId}
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
            {/* Action Buttons */}
            <div className={`mt-6 grid gap-3 ${errorInfo.canRetry ? "grid-cols-3" : "grid-cols-2"}`}>
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
                  <Phone className="mr-2 h-4 w-4" />
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
