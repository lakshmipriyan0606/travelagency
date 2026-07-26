import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";

export function PackageFormControls({ activeStep, totalSteps, nextStep, prevStep, isSubmitting, isDirty, id }: { activeStep: number, totalSteps: number, nextStep: (e?: React.MouseEvent) => void, prevStep: () => void, isSubmitting: boolean, isDirty: boolean, id: string }) {
  return (
    <div className="sticky bottom-6 z-50 px-4 mt-12">
      <div className="max-w-3xl mx-auto flex items-center gap-4 bg-white/80 backdrop-blur-xl p-3 rounded-[24px] border border-white shadow-xl shadow-neutral-200">
        {activeStep > 0 && (
          <button
            type="button"
            onClick={prevStep}
            className="px-6 py-3 rounded-xl font-bold text-[10px] tracking-wider uppercase text-neutral-500 bg-neutral-100 hover:bg-neutral-200 transition-all"
          >
            Back
          </button>
        )}
        {activeStep < totalSteps - 1 ? (
          <button
            type="button"
            onClick={(e) => nextStep(e)}
            className="flex-1 py-3 rounded-xl font-bold text-[10px] tracking-wider uppercase text-white bg-neutral-800 hover:bg-neutral-900 shadow-lg shadow-neutral-200 transition-all flex items-center justify-center gap-2"
          >
            <span>Next Step</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className={`flex-1 py-3 rounded-xl font-bold text-[10px] tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-all ${isSubmitting || !isDirty ? "bg-neutral-200 text-neutral-400 cursor-not-allowed" : "bg-gradient-to-r from-primary to-[#F69520] text-white hover:shadow-primary/40 active:scale-[0.99]"}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                <span>{id ? "Sync Changes" : "Launch Package"}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
