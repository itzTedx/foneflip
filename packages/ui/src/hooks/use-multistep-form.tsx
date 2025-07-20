import { ReactElement, useState } from "react";

export function useMultiStepForm(steps: ReactElement[]) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  function next() {
    setCurrentStepIdx((i) => {
      if (i === steps.length - 1) return i;
      return i + 1;
    });
  }

  function back() {
    setCurrentStepIdx((i) => {
      if (i <= steps.length - 1) return i;
      return i - 1;
    });
  }

  function goTo(index: number) {
    setCurrentStepIdx(index);
  }

  //   function canGoNext() {
  //     if (currentStep !== steps.length - 1) return true;
  //   }

  return {
    currentStepIdx,
    step: steps[currentStepIdx],
    steps,
    isFirstStep: currentStepIdx === 0,
    goTo,
    next,
    back,
  };
}
