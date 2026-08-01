/** Asia/Kolkata calendar parts (day/month/year). */
export function getTodayIstParts(now = new Date()): {
  day: number;
  month: number;
  year: number;
} {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const map = Object.fromEntries(
    fmt
      .formatToParts(now)
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, p.value])
  );
  return {
    day: Number(map.day),
    month: Number(map.month),
    year: Number(map.year),
  };
}

/** Parse `D-M-YYYY` / `DD-MM-YYYY` path segment. */
export function parseDevopsDateSegment(
  segment: string
): { day: number; month: number; year: number } | null {
  const m = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(segment.trim());
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    year < 2000 ||
    year > 2100
  ) {
    return null;
  }
  return { day, month, year };
}

export function isSameIstCalendarDay(
  a: { day: number; month: number; year: number },
  b: { day: number; month: number; year: number }
): boolean {
  return a.day === b.day && a.month === b.month && a.year === b.year;
}

export function formatIstDateHint(parts: {
  day: number;
  month: number;
  year: number;
}): string {
  return `${parts.day}-${parts.month}-${parts.year}`;
}
