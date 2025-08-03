export const ORGANIZATION_CATEGORIES = ["Retailer", "Wholesaler", "Reseller"] as const;
export type OrganizationCategory = (typeof ORGANIZATION_CATEGORIES)[number];

export const ONBOARDING_STEPS = ["registration", "verification", "organization", "documents"] as const;
export type OnboardingStepName = (typeof ONBOARDING_STEPS)[number];

export interface OnboardingStep {
  stepId: string;
  userId: string;
  stepName: OnboardingStepName | "complete";
  status: "pending" | "in_progress" | "completed" | "failed";
  data?: Record<string, unknown>;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingProgress {
  userId: string;
  currentStep: OnboardingStep["stepName"];
  completedSteps: OnboardingStep["stepName"][];
  totalSteps: number;
  progress: number; // 0-100
  startedAt: string;
  lastUpdatedAt: string;
}

export interface OnboardingData {
  userId: string;
  registration?: {
    name: string;
    email: string;
    invitationToken: string;
  };
  verification?: {
    email: string;
    verifiedAt: string;
  };
  organization?: {
    name: string;
    category: OrganizationCategory;
    website?: string;
    logoUrl?: string;
  };
  documents?: {
    tradeLicense?: string;
    emiratesIdFront?: string;
    emiratesIdBack?: string;
  };
  createdAt: string;
  updatedAt: string;
}
