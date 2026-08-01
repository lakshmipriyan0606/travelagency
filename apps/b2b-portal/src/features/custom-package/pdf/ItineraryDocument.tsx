/**
 * Multi-page itinerary PDF.
 *
 * Fixed pages (1–4, 8–9, 11): full-bleed finished artwork — no duplicate titles/footers.
 * Dynamic pages (days, inclusions, optional pricing): cream + gold Alatsi titles / Nunito body.
 *
 * Call ensurePdfFonts() before pdf().toBlob() so fonts are registered (see registerFonts.ts).
 */
import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import {
  PDF_ASSETS,
  PDF_COLORS,
  PDF_CONTACTS,
  PDF_PAGE_SIZE,
} from "./tokens";
import {
  type ItineraryPdfModel,
  type PdfDay,
  pdfAssetUrl,
} from "./itineraryPdfModel";
import {
  PDF_DISPLAY_FONT_FAMILY,
  PDF_FONT_FAMILY,
} from "./registerFonts";

const FONT = PDF_FONT_FAMILY;
const DISPLAY = PDF_DISPLAY_FONT_FAMILY;

const s = StyleSheet.create({
  page: {
    backgroundColor: PDF_COLORS.cream,
    fontFamily: FONT,
    color: PDF_COLORS.nearBlack,
    position: "relative",
  },
  bleedImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  /**
   * Cream patch large enough to fully cover baked-in Sastikaa mark
   * (icon + wordmark + underline + tagline) on fixed artwork pages.
   */
  logoPatch: {
    position: "absolute",
    top: 4,
    right: 8,
    width: 180,
    height: 100,
    backgroundColor: PDF_COLORS.cream,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingTop: 8,
    paddingRight: 8,
  },
  /** Dynamic pages — TravelHero only, no art underneath */
  logoWrap: {
    position: "absolute",
    top: 14,
    right: 22,
    alignItems: "flex-end",
  },
  logoMark: {
    width: 20,
    height: 20,
    backgroundColor: PDF_COLORS.gold,
    borderRadius: 10,
    marginBottom: 4,
  },
  logoText: {
    fontSize: 10,
    fontFamily: DISPLAY,
    fontWeight: 400,
    color: PDF_COLORS.nearBlack,
    letterSpacing: 0.8,
    textAlign: "right",
  },
  logoSub: {
    fontSize: 5.5,
    fontFamily: FONT,
    fontWeight: 600,
    color: PDF_COLORS.gold,
    letterSpacing: 0.4,
    marginTop: 2,
    textAlign: "right",
  },

  /** Gold contact row above charcoal bar — all dynamic pages */
  footerContacts: {
    position: "absolute",
    left: 28,
    right: 28,
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "nowrap",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7.5,
    fontFamily: FONT,
    fontWeight: 600,
    color: PDF_COLORS.gold,
  },
  footerSep: {
    fontSize: 7.5,
    fontFamily: FONT,
    fontWeight: 600,
    color: PDF_COLORS.gold,
    marginHorizontal: 8,
  },
  footerBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 14,
    backgroundColor: PDF_COLORS.charcoalBar,
  },

  iconWeb: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: PDF_COLORS.gold,
    marginRight: 4,
  },
  iconMail: {
    width: 9,
    height: 6,
    borderWidth: 1,
    borderColor: PDF_COLORS.gold,
    borderRadius: 1,
    marginRight: 4,
  },
  iconPin: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PDF_COLORS.gold,
    marginRight: 4,
  },

  dayPageTitle: {
    marginTop: 36,
    textAlign: "center",
    fontSize: 30,
    fontFamily: DISPLAY,
    fontWeight: 400,
    color: PDF_COLORS.gold,
  },
  dayContent: {
    marginTop: 26,
    paddingHorizontal: 56,
    paddingRight: 130,
    paddingBottom: 40,
  },
  dayBlock: {
    marginBottom: 22,
  },
  dayHeading: {
    fontSize: 13,
    fontFamily: DISPLAY,
    fontWeight: 400,
    color: PDF_COLORS.gold,
    textDecoration: "underline",
    marginBottom: 6,
  },
  dayMeta: {
    fontSize: 8,
    fontFamily: FONT,
    fontWeight: 400,
    color: PDF_COLORS.muted,
    marginBottom: 5,
  },
  dayBody: {
    fontSize: 10,
    fontFamily: FONT,
    fontWeight: 400,
    color: PDF_COLORS.nearBlack,
    lineHeight: 1.45,
  },

  ieWrap: {
    marginTop: 48,
    paddingLeft: 56,
    maxWidth: 460,
    paddingRight: 120,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 15,
    fontFamily: DISPLAY,
    fontWeight: 400,
    color: PDF_COLORS.gold,
    textDecoration: "underline",
    marginBottom: 10,
    marginTop: 8,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "flex-start",
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PDF_COLORS.gold,
    marginTop: 4,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    fontFamily: FONT,
    fontWeight: 700,
    color: PDF_COLORS.nearBlack,
    lineHeight: 1.35,
  },

  priceTitle: {
    marginTop: 40,
    marginLeft: 48,
    fontSize: 30,
    fontFamily: DISPLAY,
    fontWeight: 400,
    color: PDF_COLORS.gold,
    lineHeight: 1.15,
  },
  priceCard: {
    marginTop: 22,
    marginLeft: 48,
    marginRight: 200,
    borderRadius: 10,
    backgroundColor: PDF_COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  priceMeta: {
    fontSize: 8.5,
    fontFamily: FONT,
    fontWeight: 400,
    color: PDF_COLORS.muted,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_COLORS.border,
  },
  priceLabel: {
    fontSize: 10,
    fontFamily: FONT,
    fontWeight: 600,
    color: PDF_COLORS.gold,
    maxWidth: "72%",
  },
  priceValue: {
    fontSize: 10,
    fontFamily: FONT,
    fontWeight: 700,
    color: PDF_COLORS.nearBlack,
  },
  priceTotal: {
    marginTop: 10,
    borderTopWidth: 1.5,
    borderTopColor: PDF_COLORS.gold,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceTotalLabel: {
    fontSize: 12,
    fontFamily: FONT,
    fontWeight: 700,
    color: PDF_COLORS.gold,
  },
  priceTotalValue: {
    fontSize: 16,
    fontFamily: FONT,
    fontWeight: 700,
    color: PDF_COLORS.gold,
  },
});

/**
 * TravelHero mark only — never Sastikaa.
 * Pattern: gold circle above TRAVELHERO (bold dark) + gold small-caps tagline.
 */
function TravelHeroLogo({ patched = false }: { patched?: boolean }) {
  return (
    <View style={patched ? s.logoPatch : s.logoWrap} fixed>
      <View style={s.logoMark} />
      <Text style={s.logoText}>TRAVELHERO</Text>
      <Text style={s.logoSub}>DISCOVER NEW EXPERIENCES</Text>
    </View>
  );
}

/** Cream contact row + solid charcoal bottom edge (screenshot 4) */
function DynamicFooter() {
  return (
    <>
      <View style={s.footerContacts} fixed>
        <View style={s.footerItem}>
          <View style={s.iconWeb} />
          <Text style={s.footerText}>{PDF_CONTACTS.website}</Text>
        </View>
        <Text style={s.footerSep}>|</Text>
        <View style={s.footerItem}>
          <View style={s.iconMail} />
          <Text style={s.footerText}>{PDF_CONTACTS.phones}</Text>
        </View>
        <Text style={s.footerSep}>|</Text>
        <View style={s.footerItem}>
          <View style={s.iconPin} />
          <Text style={s.footerText}>{PDF_CONTACTS.location}</Text>
        </View>
      </View>
      <View style={s.footerBar} fixed />
    </>
  );
}

/** Full-bleed finished artwork — no duplicate titles or footers */
function StaticArtPage({
  src,
  replaceBrand = true,
}: {
  src: string;
  replaceBrand?: boolean;
}) {
  return (
    <Page size={PDF_PAGE_SIZE} style={s.page}>
      <Image src={src} style={s.bleedImage} />
      {replaceBrand ? <TravelHeroLogo patched /> : null}
    </Page>
  );
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}

function chunkDays(days: PdfDay[], size: number): PdfDay[][] {
  const out: PdfDay[][] = [];
  for (let i = 0; i < days.length; i += size) {
    out.push(days.slice(i, i + size));
  }
  return out;
}

function pricingMetaLine(model: ItineraryPdfModel): string {
  const parts = [
    model.name,
    model.leavingOnLabel,
    model.reference,
    model.travelersLabel,
  ].filter((p) => p && p !== "TBD");
  return parts.join(" · ");
}

type Props = {
  model: ItineraryPdfModel;
};

export function ItineraryDocument({ model }: Props) {
  const coverSrc = pdfAssetUrl(model, PDF_ASSETS.cover);
  const introSrc = pdfAssetUrl(model, PDF_ASSETS.intro);
  const bestTimeSrc = pdfAssetUrl(model, PDF_ASSETS.bestTime);
  const prepSrc = pdfAssetUrl(model, PDF_ASSETS.prep);
  const whyChooseSrc = pdfAssetUrl(model, PDF_ASSETS.whyChoose);
  const notesSrc = pdfAssetUrl(model, PDF_ASSETS.notes);
  const closingSrc = pdfAssetUrl(model, PDF_ASSETS.closing);

  const dayChunks = chunkDays(model.days, 2);

  return (
    <Document
      title={`${model.reference} — ${model.name}`}
      author="TravelHero"
      subject="Custom package itinerary"
    >
      {/* —— Fixed: cover / intro / best time / prep —— */}
      <StaticArtPage src={coverSrc} />
      <StaticArtPage src={introSrc} />
      <StaticArtPage src={bestTimeSrc} />
      <StaticArtPage src={prepSrc} />

      {/* —— Dynamic: day-wise plan —— */}
      {(dayChunks.length ? dayChunks : [[]]).map((chunk, pageIdx) => (
        <Page key={`days-${pageIdx}`} size={PDF_PAGE_SIZE} style={s.page}>
          <TravelHeroLogo />
          {pageIdx === 0 ? (
            <Text style={s.dayPageTitle}>Day Wise Plan</Text>
          ) : (
            <View style={{ height: 36 }} />
          )}
          <View style={s.dayContent}>
            {chunk.length === 0 ? (
              <Text style={s.dayBody}>
                Build the itinerary with destinations and a leave date to
                generate day-by-day plans. Empty activity slots show as free
                time.
              </Text>
            ) : (
              chunk.map((day) => (
                <View key={day.dayNum} style={s.dayBlock} wrap={false}>
                  <Text style={s.dayHeading}>{day.title}</Text>
                  <Text style={s.dayMeta}>
                    {day.dateLabel} · {day.cityName}
                    {day.hotelName ? ` · ${day.hotelName}` : ""}
                  </Text>
                  <Text style={s.dayBody}>{day.body}</Text>
                </View>
              ))
            )}
          </View>
          <DynamicFooter />
        </Page>
      ))}

      {/* —— Dynamic: inclusions / exclusions —— */}
      <Page size={PDF_PAGE_SIZE} style={s.page}>
        <TravelHeroLogo />
        <View style={s.ieWrap}>
          <Text style={s.sectionHeading}>Inclusions:</Text>
          {model.inclusions.map((line) => (
            <View key={line} style={s.bulletRow}>
              <View style={s.bulletDot} />
              <Text style={s.bulletText}>{line}</Text>
            </View>
          ))}
          <Text style={[s.sectionHeading, { marginTop: 22 }]}>Exclusions:</Text>
          {model.exclusions.map((line) => (
            <View key={line} style={s.bulletRow}>
              <View style={s.bulletDot} />
              <Text style={s.bulletText}>{line}</Text>
            </View>
          ))}
        </View>
        <DynamicFooter />
      </Page>

      {/* —— Fixed closing: why choose + notes —— */}
      <StaticArtPage src={whyChooseSrc} />
      <StaticArtPage src={notesSrc} />

      {/* —— Dynamic: price summary —— */}
      {model.pricing ? (
        <Page size={PDF_PAGE_SIZE} style={s.page}>
          <TravelHeroLogo />
          <Text style={s.priceTitle}>
            Estimated{"\n"}Travel Costs
          </Text>
          <View style={s.priceCard}>
            <Text style={s.priceMeta}>{pricingMetaLine(model)}</Text>
            {(model.pricing.breakdown || []).map((line, i) => (
              <View key={`${line.label}-${i}`} style={s.priceRow}>
                <Text style={s.priceLabel}>{line.label}</Text>
                <Text style={s.priceValue}>
                  {formatMoney(line.amount, model.pricing!.currency)}
                </Text>
              </View>
            ))}
            {model.pricing.transferTotal > 0 ? (
              <View style={s.priceRow}>
                <Text style={s.priceLabel}>Transfers</Text>
                <Text style={s.priceValue}>
                  {formatMoney(
                    model.pricing.transferTotal,
                    model.pricing.currency
                  )}
                </Text>
              </View>
            ) : null}
            <View style={s.priceTotal}>
              <Text style={s.priceTotalLabel}>Total</Text>
              <Text style={s.priceTotalValue}>
                {formatMoney(model.pricing.total, model.pricing.currency)}
              </Text>
            </View>
          </View>
          <DynamicFooter />
        </Page>
      ) : null}

      {/* —— Fixed: closing adventure —— */}
      <StaticArtPage src={closingSrc} />
    </Document>
  );
}
