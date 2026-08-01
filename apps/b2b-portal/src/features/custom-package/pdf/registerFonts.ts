/**
 * Registers PDF fonts for @react-pdf/renderer via data-URI so dynamic text
 * never silently falls back to Helvetica when HTTP font fetches fail.
 *
 * Body: Nunito 400/600/700. Display titles: Alatsi (matches Sastikaa reference).
 */
import { Font } from "@react-pdf/renderer";
import { PDF_ASSETS } from "./tokens";

export const PDF_FONT_FAMILY = "Nunito";
export const PDF_DISPLAY_FONT_FAMILY = "Alatsi";

let fontsReady = false;
let fontsPending: Promise<void> | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/** Read UTF-16BE / Mac Roman name records from a TTF ArrayBuffer (browser-safe). */
function readTtfFamilyNames(buffer: ArrayBuffer): string[] {
  if (buffer.byteLength < 12) return [];
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  const asciiAt = (off: number, len: number) =>
    String.fromCharCode(...bytes.subarray(off, off + len));

  const numTables = view.getUint16(4);
  let nameOff: number | null = null;

  for (let i = 0; i < numTables; i++) {
    const o = 12 + i * 16;
    if (asciiAt(o, 4) === "name") {
      nameOff = view.getUint32(o + 8);
      break;
    }
  }
  if (nameOff == null) return [];

  const count = view.getUint16(nameOff + 2);
  const stringOffset = view.getUint16(nameOff + 4);
  const names: string[] = [];

  for (let i = 0; i < count; i++) {
    const r = nameOff + 6 + i * 12;
    const platformID = view.getUint16(r);
    const nameID = view.getUint16(r + 6);
    const length = view.getUint16(r + 8);
    const offset = view.getUint16(r + 10);
    if (![1, 4, 6, 16].includes(nameID)) continue;

    const so = nameOff + stringOffset + offset;
    let str: string;
    if (platformID === 0 || platformID === 3) {
      str = "";
      for (let j = 0; j + 1 < length; j += 2) {
        str += String.fromCharCode((bytes[so + j] << 8) | bytes[so + j + 1]);
      }
    } else {
      str = asciiAt(so, length);
    }
    if (str) names.push(str);
  }
  return names;
}

function assertFontIdentity(
  label: string,
  buffer: ArrayBuffer,
  expectIncludes: string,
  forbidIncludes: string[] = ["ExtraLight", "Extra Light"]
): void {
  const names = readTtfFamilyNames(buffer);
  const joined = names.join(" | ");
  if (!names.some((n) => n.toLowerCase().includes(expectIncludes.toLowerCase()))) {
    throw new Error(
      `PDF font "${label}" failed identity check (expected "${expectIncludes}"): ${joined || "(no name table)"}`
    );
  }
  for (const bad of forbidIncludes) {
    if (names.some((n) => n.toLowerCase().includes(bad.toLowerCase()))) {
      throw new Error(
        `PDF font "${label}" is the wrong weight file (${bad}). Re-download ${expectIncludes} Regular/Bold — got: ${joined}`
      );
    }
  }
}

async function loadFontBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Font fetch failed (${res.status}): ${url}`);
  }
  const buf = await res.arrayBuffer();
  if (buf.byteLength < 20_000) {
    throw new Error(`Font file suspiciously small (${buf.byteLength} bytes): ${url}`);
  }
  return buf;
}

/**
 * Prefetch fonts and Font.register once. Call before pdf().toBlob().
 * Throws if files are missing or are the wrong family/weight (e.g. ExtraLight mislabeled as Regular).
 */
export async function ensurePdfFonts(assetBaseUrl: string): Promise<void> {
  if (fontsReady) return;
  if (fontsPending) return fontsPending;

  fontsPending = (async () => {
    const base = (assetBaseUrl || "").replace(/\/$/, "");
    if (!base) {
      throw new Error("PDF asset base URL is required to register fonts");
    }

    const nunitoSpecs: Array<{
      path: string;
      fontWeight: 400 | 600 | 700;
      expect: string;
    }> = [
      { path: PDF_ASSETS.fontRegular, fontWeight: 400, expect: "Nunito" },
      { path: PDF_ASSETS.fontSemiBold, fontWeight: 600, expect: "Nunito" },
      { path: PDF_ASSETS.fontBold, fontWeight: 700, expect: "Nunito" },
    ];

    const nunitoFonts = await Promise.all(
      nunitoSpecs.map(async ({ path, fontWeight, expect }) => {
        const buffer = await loadFontBuffer(`${base}${path}`);
        assertFontIdentity(path, buffer, expect);
        return {
          src: `data:font/ttf;base64,${arrayBufferToBase64(buffer)}`,
          fontWeight,
        };
      })
    );

    const alatsiBuf = await loadFontBuffer(`${base}${PDF_ASSETS.fontDisplay}`);
    assertFontIdentity(PDF_ASSETS.fontDisplay, alatsiBuf, "Alatsi", [
      "ExtraLight",
    ]);

    Font.register({
      family: PDF_FONT_FAMILY,
      fonts: nunitoFonts,
    });

    Font.register({
      family: PDF_DISPLAY_FONT_FAMILY,
      fonts: [
        {
          src: `data:font/ttf;base64,${arrayBufferToBase64(alatsiBuf)}`,
          fontWeight: 400,
        },
      ],
    });

    fontsReady = true;
  })();

  try {
    await fontsPending;
  } catch (err) {
    fontsReady = false;
    throw err;
  } finally {
    fontsPending = null;
  }
}

/** Test helper — forces the next ensurePdfFonts call to re-fetch/register. */
export function resetPdfFontsForTests(): void {
  fontsReady = false;
  fontsPending = null;
}
