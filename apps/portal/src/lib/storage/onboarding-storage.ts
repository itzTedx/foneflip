import { createStorage } from "./indexdb-client";

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
// Create onboarding storage instances
const onboardingStepsStorage = createStorage<OnboardingStep>({
  dbName: "onboarding-steps-db",
  version: 1,
  storeName: "steps",
  keyPath: "stepId",
  indexes: [
    { name: "userId", keyPath: "userId" },
    { name: "stepName", keyPath: "stepName" },
    { name: "status", keyPath: "status" },
  ],
});

const onboardingProgressStorage = createStorage<OnboardingProgress>({
  dbName: "onboarding-progress-db",
  version: 1,
  storeName: "progress",
  keyPath: "userId",
  indexes: [
    { name: "currentStep", keyPath: "currentStep" },
    { name: "progress", keyPath: "progress" },
  ],
});

const onboardingDataStorage = createStorage<OnboardingData>({
  dbName: "onboarding-data-db",
  version: 1,
  storeName: "data",
  keyPath: "userId",
  indexes: [
    { name: "createdAt", keyPath: "createdAt" },
    { name: "updatedAt", keyPath: "updatedAt" },
  ],
});

// Step management functions
export async function createStep(
  userId: string,
  stepName: OnboardingStep["stepName"],
  data?: Record<string, unknown>
): Promise<string> {
  const stepId = crypto.randomUUID();
  const now = new Date().toISOString();

  await onboardingStepsStorage.save({
    stepId,
    userId,
    stepName,
    status: "in_progress",
    data,
    createdAt: now,
    updatedAt: now,
  });

  return stepId;
}

export async function updateStep(
  stepId: string,
  updates: Partial<Omit<OnboardingStep, "stepId" | "userId" | "createdAt">>
): Promise<void> {
  const existingStep = await onboardingStepsStorage.get(stepId);
  if (!existingStep) {
    throw new Error("Step not found");
  }

  await onboardingStepsStorage.update(stepId, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function completeStep(stepId: string, data?: Record<string, unknown>): Promise<void> {
  const now = new Date().toISOString();
  await updateStep(stepId, {
    status: "completed",
    data,
    completedAt: now,
  });
}

export async function getUserSteps(userId: string): Promise<OnboardingStep[]> {
  return await onboardingStepsStorage.getByIndex("userId", userId);
}

export async function getStepByUserAndName(
  userId: string,
  stepName: OnboardingStep["stepName"]
): Promise<OnboardingStep | null> {
  const steps = await getUserSteps(userId);
  return steps.find((step) => step.stepName === stepName) || null;
}

// Progress management functions
export async function initializeProgress(userId: string): Promise<void> {
  const now = new Date().toISOString();

  await onboardingProgressStorage.save({
    userId,
    currentStep: "registration",
    completedSteps: [],
    totalSteps: 4, // registration, verification, organization, documents
    progress: 0,
    startedAt: now,
    lastUpdatedAt: now,
  });
}

export async function updateProgress(
  userId: string,
  currentStep: OnboardingStep["stepName"],
  completedSteps: OnboardingStep["stepName"][]
): Promise<void> {
  const progress = Math.round((completedSteps.length / 4) * 100);

  await onboardingProgressStorage.update(userId, {
    currentStep,
    completedSteps,
    progress,
    lastUpdatedAt: new Date().toISOString(),
  });
}

export async function getProgress(userId: string): Promise<OnboardingProgress | null> {
  return await onboardingProgressStorage.get(userId);
}

// Data management functions
export async function saveOnboardingData(userId: string, data: Partial<OnboardingData>): Promise<void> {
  const existingData = await onboardingDataStorage.get(userId);
  const now = new Date().toISOString();

  if (existingData) {
    await onboardingDataStorage.update(userId, {
      ...data,
      updatedAt: now,
    });
  } else {
    await onboardingDataStorage.save({
      userId,
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  }
}

export async function getOnboardingData(userId: string): Promise<OnboardingData | null> {
  return await onboardingDataStorage.get(userId);
}

export async function updateOnboardingData(
  userId: string,
  updates: Partial<Omit<OnboardingData, "userId" | "createdAt">>
): Promise<void> {
  const existingData = await getOnboardingData(userId);
  if (!existingData) {
    throw new Error("Onboarding data not found");
  }

  await onboardingDataStorage.update(userId, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

// Utility functions
export async function getNextStep(currentStep: OnboardingStep["stepName"]): Promise<OnboardingStep["stepName"] | null> {
  const stepOrder: OnboardingStep["stepName"][] = [
    "registration",
    "verification",
    "organization",
    "documents",
    "complete",
  ];
  const currentIndex = stepOrder.indexOf(currentStep);

  if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
    return null;
  }

  return stepOrder[currentIndex + 1] || null;
}

export async function isStepCompleted(userId: string, stepName: OnboardingStep["stepName"]): Promise<boolean> {
  const step = await getStepByUserAndName(userId, stepName);
  return step?.status === "completed";
}

export async function getCompletedSteps(userId: string): Promise<OnboardingStep["stepName"][]> {
  const steps = await getUserSteps(userId);
  return steps.filter((step) => step.status === "completed" && step.stepName).map((step) => step.stepName!);
}

export async function clearOnboardingData(userId: string): Promise<void> {
  // Clear all onboarding data for a user
  const steps = await getUserSteps(userId);
  for (const step of steps) {
    await onboardingStepsStorage.delete(step.stepId);
  }

  await onboardingProgressStorage.delete(userId);
  await onboardingDataStorage.delete(userId);
}
