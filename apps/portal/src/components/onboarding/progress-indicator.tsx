"use client";

import { IconCheck } from "@tabler/icons-react";

import { Badge } from "@ziron/ui/badge";
import { Progress } from "@ziron/ui/progress";

import { useOnboarding } from "@/hooks/use-onboarding";

interface OnboardingStep {
  name: "registration" | "verification" | "organization" | "documents" | "complete";
  label: string;
  description: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    name: "registration",
    label: "Registration",
    description: "Create your account",
  },
  {
    name: "verification",
    label: "Verification",
    description: "Verify your email",
  },
  {
    name: "organization",
    label: "Organization",
    description: "Set up your business",
  },
  {
    name: "documents",
    label: "Documents",
    description: "Upload required documents",
  },
  {
    name: "complete",
    label: "Complete",
    description: "Review and finish",
  },
];

interface ProgressIndicatorProps {
  userId: string;
  currentStep?: string;
  className?: string;
}

export function OnboardingProgressIndicator({ userId, currentStep, className = "" }: ProgressIndicatorProps) {
  const { progress, getProgressPercentage, getCurrentStepName, getCompletedStepsList, isLoading } =
    useOnboarding(userId);

  const progressPercentage = getProgressPercentage();
  const currentStepName = getCurrentStepName();
  const completedSteps = getCompletedStepsList();

  if (isLoading) {
    return (
      <div className={`flex flex-col space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Onboarding Progress</h3>
          <Badge variant="secondary">Loading...</Badge>
        </div>
        <Progress className="h-2" value={0} />
      </div>
    );
  }

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Onboarding Progress</h3>
        <Badge variant="secondary">{progressPercentage}% Complete</Badge>
      </div>
      <Progress className="h-2" value={progressPercentage} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {ONBOARDING_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.name);
          const isCurrent = currentStepName === step.name;
          const isActive = isCurrent || isCompleted;

          return (
            <div
              className={`relative flex flex-col items-center rounded-lg border p-3 text-center transition-colors ${
                isActive
                  ? isCompleted
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                    : "border-primary bg-primary/5"
                  : "border-muted bg-muted/30"
              }`}
              key={step.name}
            >
              {/* Step number */}
              <div
                className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full font-semibold text-xs ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? <IconCheck className="h-4 w-4" /> : index + 1}
              </div>

              {/* Step label */}
              <h4 className="font-medium text-xs">{step.label}</h4>

              {/* Step description */}
              <p className="mt-1 text-muted-foreground text-xs">{step.description}</p>

              {/* Current step indicator */}
              {isCurrent && <div className="-top-1 -right-1 absolute h-3 w-3 animate-pulse rounded-full bg-primary" />}
            </div>
          );
        })}
      </div>
      {progress && (
        <div className="text-muted-foreground text-xs">
          {progress.startedAt && <p>Started: {new Date(progress.startedAt).toLocaleDateString()}</p>}
          {progress.lastUpdatedAt && <p>Last updated: {new Date(progress.lastUpdatedAt).toLocaleDateString()}</p>}
        </div>
      )}{" "}
    </div>
  );
}
