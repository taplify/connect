import { useState } from "react";

const useStep = (steps: number) => {
  const [currentStep, setCurrentStep] = useState(1);
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === steps;

  const nextStep = () => {
    if (currentStep === steps) return;

    setCurrentStep((prev) => prev + 1);
  };

  const previousStep = () => {
    if (currentStep === 1) return;

    setCurrentStep((prev) => prev - 1);
  };

  const skipStep = (stepNumber: number) => {
    if (stepNumber < 1 || stepNumber > steps) return;

    setCurrentStep(stepNumber);
  };

  return {
    currentStep,
    setCurrentStep,
    isFirstStep,
    isLastStep,
    nextStep,
    previousStep,
    skipStep,
  };
};

export default useStep;
