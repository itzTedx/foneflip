import { DatabaseManager } from "@ziron/db/indexdb";

import type { OnboardingData, OnboardingProgress, OnboardingStep } from "./types";

// Storage interface for type safety
interface StorageInstance<T> {
  save(data: T): Promise<void>;
  get(key: string | number): Promise<T | null>;
  update(key: string | number, updates: Partial<T>): Promise<void>;
  delete(key: string | number): Promise<void>;
  getByIndex(indexName: string, key: string | number): Promise<T[]>;
  batchDelete(keys: (string | number)[]): Promise<void>;
}

// Optimized storage instances using the centralized manager
let stepsStorage: StorageInstance<OnboardingStep> | null = null;
let progressStorage: StorageInstance<OnboardingProgress> | null = null;
let dataStorage: StorageInstance<OnboardingData> | null = null;

async function getStepsStorage() {
  if (!stepsStorage) {
    const manager = DatabaseManager.getInstance();
    await manager.initialize();

    const config = {
      dbName: "onboarding-steps-db",
      version: 1,
      storeName: "steps",
      keyPath: "stepId" as keyof OnboardingStep,
      indexes: [
        { name: "userId", keyPath: "userId" as keyof OnboardingStep },
        { name: "stepName", keyPath: "stepName" as keyof OnboardingStep },
        { name: "status", keyPath: "status" as keyof OnboardingStep },
      ],
    };
    stepsStorage = await manager.createStorage<OnboardingStep>(config);
  }
  return stepsStorage;
}

async function getProgressStorage() {
  if (!progressStorage) {
    const manager = DatabaseManager.getInstance();
    await manager.initialize();

    const config = {
      dbName: "onboarding-progress-db",
      version: 1,
      storeName: "progress",
      keyPath: "userId" as keyof OnboardingProgress,
      indexes: [
        { name: "currentStep", keyPath: "currentStep" as keyof OnboardingProgress },
        { name: "progress", keyPath: "progress" as keyof OnboardingProgress },
      ],
    };
    progressStorage = await manager.createStorage<OnboardingProgress>(config);
  }
  return progressStorage;
}

async function getDataStorage() {
  if (!dataStorage) {
    const manager = DatabaseManager.getInstance();
    await manager.initialize();

    const config = {
      dbName: "onboarding-data-db",
      version: 1,
      storeName: "data",
      keyPath: "userId" as keyof OnboardingData,
      indexes: [
        { name: "createdAt", keyPath: "createdAt" as keyof OnboardingData },
        { name: "updatedAt", keyPath: "updatedAt" as keyof OnboardingData },
      ],
    };
    dataStorage = await manager.createStorage<OnboardingData>(config);
  }
  return dataStorage;
}

// Step management functions
export async function createStep(
  userId: string,
  stepName: OnboardingStep["stepName"],
  data?: Record<string, unknown>
): Promise<string> {
  const storage = await getStepsStorage();
  const stepId = crypto.randomUUID();
  const now = new Date().toISOString();

  await storage.save({
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
  const storage = await getStepsStorage();
  const existingStep = await storage.get(stepId);
  if (!existingStep) {
    throw new Error("Step not found");
  }

  await storage.update(stepId, {
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
  const storage = await getStepsStorage();
  return await storage.getByIndex("userId", userId);
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
  const storage = await getProgressStorage();
  const now = new Date().toISOString();

  await storage.save({
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
  const storage = await getProgressStorage();
  const progress = Math.round((completedSteps.length / 4) * 100);

  await storage.update(userId, {
    currentStep,
    completedSteps,
    progress,
    lastUpdatedAt: new Date().toISOString(),
  });
}

export async function getProgress(userId: string): Promise<OnboardingProgress | null> {
  const storage = await getProgressStorage();
  return await storage.get(userId);
}

// Data management functions
export async function saveOnboardingData(userId: string, data: Partial<OnboardingData>): Promise<void> {
  const storage = await getDataStorage();
  const existingData = await storage.get(userId);
  const now = new Date().toISOString();

  if (existingData) {
    await storage.update(userId, {
      ...data,
      updatedAt: now,
    });
  } else {
    await storage.save({
      userId,
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  }
}

export async function getOnboardingData(userId: string): Promise<OnboardingData | null> {
  const storage = await getDataStorage();
  return await storage.get(userId);
}

export async function updateOnboardingData(
  userId: string,
  updates: Partial<Omit<OnboardingData, "userId" | "createdAt">>
): Promise<void> {
  const storage = await getDataStorage();
  const existingData = await getOnboardingData(userId);
  if (!existingData) {
    throw new Error("Onboarding data not found");
  }

  await storage.update(userId, {
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
  const stepsStorage = await getStepsStorage();
  const progressStorage = await getProgressStorage();
  const dataStorage = await getDataStorage();

  const steps = await getUserSteps(userId);
  const stepIds = steps.map((step) => step.stepId);

  if (stepIds.length > 0) {
    await stepsStorage.batchDelete(stepIds);
  }

  await progressStorage.delete(userId);
  await dataStorage.delete(userId);
}

// Health check and maintenance
export async function healthCheck(): Promise<boolean> {
  try {
    const manager = DatabaseManager.getInstance();
    const health = await manager.healthCheck();
    return health.healthy;
  } catch {
    return false;
  }
}

export async function clearCache(): Promise<void> {
  const manager = DatabaseManager.getInstance();
  // Clear cache by getting stats (this will trigger cache cleanup)
  manager.getStats();
}

export function getStats(): { managers: number; storages: number; isInitialized: boolean } {
  const manager = DatabaseManager.getInstance();
  return manager.getStats();
}
