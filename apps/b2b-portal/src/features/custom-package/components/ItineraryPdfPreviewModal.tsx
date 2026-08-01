/**
 * Preview itinerary PDF in a modal (blob URL iframe).
 */
"use client";

import { useEffect, useState } from "react";
import { Download, Eye, Loader2, X } from "lucide-react";
import { Button } from "@travelagency/ui";
import { cn } from "@travelagency/utils";
import type { CustomProposal } from "../types/proposal.types";
import {
  downloadItineraryPdf,
  proposalToPdfModel,
  renderItineraryPdfBlob,
  sanitizePdfFilename,
} from "../pdf";

type ItineraryPdfPreviewModalProps = {
  open: boolean;
  proposal: CustomProposal | null;
  onClose: () => void;
};

export function ItineraryPdfPreviewModal({
  open,
  proposal,
  onClose,
}: ItineraryPdfPreviewModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open || !proposal) {
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setError(null);
      return;
    }

    let cancelled = false;
    let createdUrl: string | null = null;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const model = proposalToPdfModel(proposal);
        const blob = await renderItineraryPdfBlob(model);
        if (cancelled) return;
        createdUrl = URL.createObjectURL(blob);
        setBlobUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return createdUrl;
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not render PDF preview"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [open, proposal]);

  if (!open) return null;

  const title =
    proposal?.name?.trim() ||
    proposal?.reference ||
    "Itinerary PDF";

  const handleDownload = async () => {
    if (!proposal) return;
    setDownloading(true);
    try {
      await downloadItineraryPdf(proposal);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not download PDF"
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-3 sm:p-6 pt-10 sm:pt-12 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Preview itinerary PDF"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-2xl border border-white/10 bg-[#121216] shadow-2xl overflow-hidden my-2 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-white/[0.08] shrink-0">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#F8B400]">
              Preview PDF
            </p>
            <h3 className="text-base font-semibold text-white mt-0.5 truncate">
              {title}
            </h3>
            {proposal?.reference ? (
              <p className="text-xs text-zinc-500 mt-0.5">
                {sanitizePdfFilename(
                  proposal.reference,
                  proposal.name || "itinerary"
                )}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              className="bg-[#F8B400] text-black hover:bg-[#FFD54A] font-semibold h-9 text-xs sm:text-sm"
              disabled={!proposal || downloading || loading}
              onClick={handleDownload}
            >
              {downloading ? (
                <Loader2 size={14} className="mr-1.5 animate-spin" />
              ) : (
                <Download size={14} className="mr-1.5" />
              )}
              Download
            </Button>
            <button
              type="button"
              className="rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-white/5"
              onClick={onClose}
              aria-label="Close preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="relative flex-1 min-h-[60vh] bg-[#0A0A0C]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <Loader2 className="animate-spin text-[#F8B400]" size={28} />
              <p className="text-sm">Rendering itinerary…</p>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <p className="text-sm text-red-300 text-center max-w-md">{error}</p>
            </div>
          ) : blobUrl ? (
            <iframe
              title="Itinerary PDF preview"
              src={blobUrl}
              className={cn("w-full h-full min-h-[60vh] border-0 bg-white")}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

type ItineraryPdfActionsProps = {
  proposal: CustomProposal | null | undefined;
  /** Composer: enable when itinerary built / draft exists */
  enabled?: boolean;
  className?: string;
  size?: "default" | "sm";
};

/** Preview + Download buttons shared by composer header and My Proposals rows. */
export function ItineraryPdfActions({
  proposal,
  enabled = true,
  className,
  size = "default",
}: ItineraryPdfActionsProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canUse = Boolean(enabled && proposal?.id);

  const handleDownload = async () => {
    if (!proposal) return;
    setDownloading(true);
    setError(null);
    try {
      await downloadItineraryPdf(proposal);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const btnClass =
    size === "sm"
      ? "border-[#F8B400]/35 text-[#FFD54A] h-8 text-xs px-2.5"
      : "border-[#F8B400]/35 text-[#FFD54A]";

  return (
    <>
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <Button
          type="button"
          variant="outline"
          className={btnClass}
          disabled={!canUse}
          onClick={() => setPreviewOpen(true)}
          title={
            canUse
              ? "Preview itinerary PDF"
              : "Build itinerary / open a draft first"
          }
        >
          <Eye size={size === "sm" ? 14 : 16} className="mr-1.5" />
          Preview
        </Button>
        <Button
          type="button"
          variant="outline"
          className={btnClass}
          disabled={!canUse || downloading}
          onClick={handleDownload}
          title={
            canUse
              ? "Download itinerary PDF"
              : "Build itinerary / open a draft first"
          }
        >
          {downloading ? (
            <Loader2
              size={size === "sm" ? 14 : 16}
              className="mr-1.5 animate-spin"
            />
          ) : (
            <Download size={size === "sm" ? 14 : 16} className="mr-1.5" />
          )}
          Download
        </Button>
      </div>
      {error ? (
        <p className="text-[11px] text-red-300 mt-1 w-full">{error}</p>
      ) : null}
      <ItineraryPdfPreviewModal
        open={previewOpen}
        proposal={proposal ?? null}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}
