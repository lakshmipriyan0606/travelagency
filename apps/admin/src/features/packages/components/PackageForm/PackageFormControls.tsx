import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";

export function PackageFormControls({ activeStep, totalSteps, nextStep, prevStep, isSubmitting, isDirty, id }: { activeStep: number, totalSteps: number, nextStep: (e?: React.MouseEvent) => void, prevStep: () => void, isSubmitting: boolean, isDirty: boolean, id: string }) {
  return (
    <div className="sticky bottom-6 z-50 px-4 mt-12">
      <div className="max-w-3xl mx-auto flex items-center gap-3 bg-[var(--ent-card,#16161b)]/95 backdrop-blur-xl p-3 rounded-[20px] border border-white/[0.1] shadow-[0_12px_36px_rgba(0,0,0,0.55),0_0_0_1px_rgba(248,180,0,0.08)]">
        {activeStep > 0 && (
          <button
            type="button"
            onClick={prevStep}
            className="px-6 py-3 rounded-xl font-bold text-[10px] tracking-wider uppercase text-zinc-300 bg-[var(--ent-elevated,#1c1c22)] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
          >
            Back
          </button>
        )}
        {activeStep < totalSteps - 1 ? (
          <button
            type="button"
            onClick={(e) => nextStep(e)}
            className="flex-1 py-3 rounded-xl font-extrabold text-[11px] tracking-wider uppercase text-[#0c0c0f] bg-gradient-to-r from-[#FFD54A] via-[#F8B400] to-[#E8A800] hover:brightness-105 shadow-[0_4px_18px_rgba(248,180,0,0.35)] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Next Step</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className={`flex-1 py-3 rounded-xl font-extrabold text-[11px] tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-200 ${isSubmitting || !isDirty ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-gradient-to-r from-[#FFD54A] via-[#F8B400] to-[#E8A800] text-[#0c0c0f] hover:brightness-105 shadow-[0_4px_18px_rgba(248,180,0,0.35)] active:scale-[0.98]"}`}
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
