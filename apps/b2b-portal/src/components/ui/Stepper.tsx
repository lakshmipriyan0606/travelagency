/**
 * Stepper Component — polished enterprise progress stepper.
 */
"use client";

import React from "react";
import { Check, AlertCircle } from "lucide-react";

export interface StepItem {
  readonly id: number;
  readonly name: string;
}

interface StepperProps {
  steps: readonly StepItem[];
  currentStep: number;
  completedSteps: number[];
  validationErrors?: Record<number, boolean>;
  onStepClick?: (stepId: number) => void;
}

export default function Stepper({
  steps,
  currentStep,
  completedSteps,
  validationErrors = {},
  onStepClick,
}: StepperProps) {
  const currentPercentage = Math.round((currentStep / steps.length) * 100);

  return (
    <div className="w-full">
      {/* Mobile Stepper View */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border border-neutral-200 shadow-premium rounded-2xl mb-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm font-semibold text-text-primary mt-0.5">
            {steps.find((s) => s.id === currentStep)?.name}
          </span>
        </div>
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-neutral-100"
              strokeWidth="2.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-primary-accent transition-all duration-300"
              strokeDasharray={`${currentPercentage}, 100`}
              strokeWidth="2.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-[10px] font-bold text-text-primary">{currentPercentage}%</span>
        </div>
      </div>

      {/* Desktop Stepper View */}
      <div className="hidden lg:flex items-center w-full relative select-none">
        {steps.map((step, idx) => {
          const isCompleted = completedSteps.includes(step.id);
          const isActive = step.id === currentStep;
          const hasError = validationErrors[step.id];

          const stepClickable = isCompleted && onStepClick;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle & Details */}
              <button
                type="button"
                onClick={() => stepClickable && onStepClick(step.id)}
                disabled={!stepClickable}
                className={`flex items-center gap-3 relative focus:outline-none transition group ${
                  stepClickable ? "cursor-pointer" : "cursor-default"
                }`}
              >
                {/* Step Circle Bubble */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold text-xs transition duration-200 ${
                    isActive
                      ? "bg-primary-accent border-primary-accent text-white shadow-md shadow-primary-accent/15"
                      : isCompleted
                      ? hasError
                        ? "bg-red-50 border-red-200 text-red-500"
                        : "bg-neutral-100 border-neutral-200 text-primary-accent group-hover:border-neutral-300"
                      : "bg-neutral-50 border-neutral-200 text-text-muted"
                  }`}
                >
                  {isCompleted ? (
                    hasError ? <AlertCircle size={14} /> : <Check size={14} strokeWidth={2.5} />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                {/* Step Text Labels */}
                <div className="flex flex-col text-left">
                  <span
                    className={`text-[9px] uppercase font-bold tracking-widest ${
                      isActive ? "text-primary-accent" : "text-text-muted"
                    }`}
                  >
                    Step {step.id}
                  </span>
                  <span
                    className={`text-xs font-bold transition-colors ${
                      isActive ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              </button>

              {/* Progress Line Divider */}
              {idx < steps.length - 1 && (
                <div className="flex-1 mx-4 h-[1px] bg-neutral-200 relative">
                  <div
                    className={`absolute inset-0 bg-primary-accent transition-all duration-300 ${
                      isCompleted ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
