import { useCallback, useEffect, useState } from "react";

import {
  clearOnboardingData,
  completeStep,
  createStep,
  getCompletedSteps,
  getNextStep,
  getOnboardingData,
  getProgress,
  getStepByUserAndName,
  initializeProgress,
  isStepCompleted,
  OnboardingData,
  OnboardingProgress,
  OnboardingStep,
  saveOnboardingData,
  updateProgress,
} from "@/lib/storage/onboarding-storage";

export function useOnboarding(userId?: string) {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load onboarding data on mount
  useEffect(() => {
    if (!userId) return;

    const loadOnboardingData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Initialize progress if it doesn't exist
        let progressData = await getProgress(userId);
        if (!progressData) {
          await initializeProgress(userId);
          progressData = await getProgress(userId);
        }

        // Load onboarding data
        const data = await getOnboardingData(userId);

        setProgress(progressData);
        setOnboardingData(data);

        // Load current step
        if (progressData?.currentStep) {
          const step = await getStepByUserAndName(userId, progressData.currentStep);
          setCurrentStep(step);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load onboarding data");
        console.error("Failed to load onboarding data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingData();
  }, [userId]);

  const startStep = useCallback(
    async (stepName: OnboardingStep["stepName"], data?: Record<string, unknown>): Promise<string> => {
      if (!userId) throw new Error("User ID is required");

      setIsLoading(true);
      setError(null);

      try {
        const stepId = await createStep(userId, stepName, data);

        // Update progress
        const completedSteps = await getCompletedSteps(userId);
        await updateProgress(userId, stepName, completedSteps);

        // Reload progress
        const newProgress = await getProgress(userId);
        setProgress(newProgress);

        return stepId;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start step");
        console.error("Failed to start step:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const completeCurrentStep = useCallback(
    async (data?: Record<string, unknown>): Promise<void> => {
      if (!userId || !currentStep) throw new Error("User ID and current step are required");

      setIsLoading(true);
      setError(null);

      try {
        await completeStep(currentStep.stepId, data);

        // Update progress
        const completedSteps = await getCompletedSteps(userId);
        const nextStep = await getNextStep(currentStep.stepName);

        if (nextStep) {
          await updateProgress(userId, nextStep, completedSteps);
        }

        // Reload data
        const newProgress = await getProgress(userId);
        const newData = await getOnboardingData(userId);

        setProgress(newProgress);
        setOnboardingData(newData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to complete step");
        console.error("Failed to complete step:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, currentStep]
  );

  const saveData = useCallback(
    async (data: Partial<OnboardingData>): Promise<void> => {
      if (!userId) throw new Error("User ID is required");

      setIsLoading(true);
      setError(null);

      try {
        await saveOnboardingData(userId, data);

        // Reload data
        const newData = await getOnboardingData(userId);
        setOnboardingData(newData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save data");
        console.error("Failed to save data:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const checkStepCompletion = useCallback(
    async (stepName: OnboardingStep["stepName"]): Promise<boolean> => {
      if (!userId) return false;

      try {
        return await isStepCompleted(userId, stepName);
      } catch (err) {
        console.error("Failed to check step completion:", err);
        return false;
      }
    },
    [userId]
  );

  const resetOnboarding = useCallback(async (): Promise<void> => {
    if (!userId) throw new Error("User ID is required");

    setIsLoading(true);
    setError(null);

    try {
      await clearOnboardingData(userId);
      await initializeProgress(userId);

      // Reload data
      const newProgress = await getProgress(userId);
      const newData = await getOnboardingData(userId);

      setProgress(newProgress);
      setOnboardingData(newData);
      setCurrentStep(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset onboarding");
      console.error("Failed to reset onboarding:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const getProgressPercentage = useCallback((): number => {
    return progress?.progress || 0;
  }, [progress]);

  const getCurrentStepName = useCallback((): OnboardingStep["stepName"] | null => {
    return progress?.currentStep || null;
  }, [progress]);

  const getCompletedStepsList = useCallback((): OnboardingStep["stepName"][] => {
    return progress?.completedSteps || [];
  }, [progress]);

  return {
    // State
    progress,
    onboardingData,
    currentStep,
    isLoading,
    error,

    // Actions
    startStep,
    completeCurrentStep,
    saveData,
    checkStepCompletion,
    resetOnboarding,

    // Computed values
    getProgressPercentage,
    getCurrentStepName,
    getCompletedStepsList,
  };
}
