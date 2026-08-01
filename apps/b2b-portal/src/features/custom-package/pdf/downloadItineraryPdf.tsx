/**
 * Client-side itinerary PDF download via @react-pdf/renderer pdf().toBlob().
 */
import { pdf } from "@react-pdf/renderer";
import React from "react";
import type { CustomProposal } from "../types/proposal.types";
import { ItineraryDocument } from "./ItineraryDocument";
import {
  buildItineraryPdfModel,
  sanitizePdfFilename,
  type ItineraryPdfModel,
} from "./itineraryPdfModel";
import { ensurePdfFonts } from "./registerFonts";

export function getPdfAssetBaseUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

export function proposalToPdfModel(proposal: CustomProposal): ItineraryPdfModel {
  return buildItineraryPdfModel(proposal, {
    assetBaseUrl: getPdfAssetBaseUrl(),
  });
}

export async function renderItineraryPdfBlob(
  model: ItineraryPdfModel
): Promise<Blob> {
  const base = model.assetBaseUrl || getPdfAssetBaseUrl();
  await ensurePdfFonts(base);
  const instance = pdf(<ItineraryDocument model={model} />);
  return instance.toBlob();
}

export async function downloadItineraryPdf(
  proposal: CustomProposal
): Promise<void> {
  const model = proposalToPdfModel(proposal);
  const blob = await renderItineraryPdfBlob(model);
  const filename = sanitizePdfFilename(model.reference, model.name);
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
