/**
 * Stepper Component — polished enterprise progress stepper (dark + gold).
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@travelagency/utils";

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
      {/* Mobile */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[var(--ent-card,#16161b)] border border-white/[0.08] rounded-2xl mb-6 ent-card-shadow">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm font-semibold text-white mt-0.5">
            {steps.find((s) => s.id === currentStep)?.name}
          </span>
        </div>
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-zinc-700"
              strokeWidth="2.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-[#F8B400] transition-all duration-500"
              strokeDasharray={`${currentPercentage}, 100`}
              strokeWidth="2.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-[10px] font-bold text-[#F8B400]">{currentPercentage}%</span>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex items-center w-full relative select-none px-1">
        {steps.map((step, idx) => {
          const isCompleted = completedSteps.includes(step.id);
          const isActive = step.id === currentStep;
          const hasError = validationErrors[step.id];
          const stepClickable = (isCompleted || step.id < currentStep) && onStepClick;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => stepClickable && onStepClick(step.id)}
                disabled={!stepClickable}
                className={cn(
                  "flex items-center gap-3 relative focus:outline-none transition group",
                  stepClickable ? "cursor-pointer" : "cursor-default"
                )}
              >
                <motion.div
                  layout
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border font-bold text-xs transition-colors duration-300",
                    isActive &&
                      "bg-gradient-to-br from-[#FFD54A] via-[#F8B400] to-[#E8A800] border-[#F8B400] text-black shadow-[0_4px_18px_rgba(248,180,0,0.4)]",
                    !isActive &&
                      isCompleted &&
                      !hasError &&
                      "bg-[#F8B400]/15 border-[#F8B400]/40 text-[#F8B400]",
                    !isActive &&
                      isCompleted &&
                      hasError &&
                      "bg-red-500/15 border-red-500/40 text-red-400",
                    !isActive &&
                      !isCompleted &&
                      "bg-[var(--ent-elevated,#1c1c22)] border-white/[0.1] text-zinc-500"
                  )}
                  animate={isActive ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {isCompleted && !isActive ? (
                    hasError ? <AlertCircle size={14} /> : <Check size={14} strokeWidth={2.5} />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </motion.div>

                <div className="flex flex-col text-left min-w-0">
                  <span
                    className={cn(
                      "text-[9px] uppercase font-bold tracking-widest",
                      isActive ? "text-[#F8B400]" : "text-zinc-600"
                    )}
                  >
                    Step {step.id}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold transition-colors truncate",
                      isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                    )}
                  >
                    {step.name}
                  </span>
                </div>
              </button>

              {idx < steps.length - 1 && (
                <div className="flex-1 mx-3 h-[2px] bg-white/[0.06] relative rounded-full overflow-hidden min-w-[24px]">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#F8B400] to-[#FFD54A] rounded-full"
                    initial={false}
                    animate={{ width: isCompleted ? "100%" : "0%" }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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
