"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import {
  cn,
  getJwtExpirySeconds,
  readBrowserCookie,
} from "@travelagency/utils";

export interface SessionTimerProps {
  /** Unix seconds — preferred when cookie is httpOnly (e.g. B2C admin session). */
  expiresAt?: number | null;
  /** Readable cookie that holds a JWT access token (B2B portal / B2B admin). */
  cookieName?: string;
  /** Called once when remaining time hits zero. */
  onExpired?: () => void;
  className?: string;
  /** Hide the component when expiry cannot be determined. */
  hideWhenUnknown?: boolean;
}

function formatRemaining(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function resolveExpirySeconds(
  expiresAt: number | null | undefined,
  cookieName: string | undefined
): number | null {
  if (typeof expiresAt === "number" && Number.isFinite(expiresAt) && expiresAt > 0) {
    return expiresAt;
  }
  if (cookieName) {
    return getJwtExpirySeconds(readBrowserCookie(cookieName));
  }
  return null;
}

/**
 * Live countdown until access-token / session JWT expiry.
 * Prefer JWT `exp` (or server-provided `expiresAt`) — never cookie Max-Age heuristics.
 */
export function SessionTimer({
  expiresAt,
  cookieName,
  onExpired,
  className,
  hideWhenUnknown = true,
}: SessionTimerProps) {
  const expiredFired = React.useRef(false);
  const [expiry, setExpiry] = React.useState<number | null>(() =>
    resolveExpirySeconds(expiresAt, cookieName)
  );
  const [remaining, setRemaining] = React.useState<number | null>(null);

  React.useEffect(() => {
    expiredFired.current = false;
    setExpiry(resolveExpirySeconds(expiresAt, cookieName));
  }, [expiresAt, cookieName]);

  React.useEffect(() => {
    if (expiry == null) {
      setRemaining(null);
      return;
    }

    const tick = () => {
      const next = Math.max(0, expiry - Math.floor(Date.now() / 1000));
      setRemaining(next);
      if (next <= 0 && !expiredFired.current) {
        expiredFired.current = true;
        onExpired?.();
      }
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiry, onExpired]);

  if (remaining == null) {
    if (hideWhenUnknown) return null;
    return null;
  }

  const urgent = remaining <= 120;
  const critical = remaining <= 30;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border text-[12px] font-bold tabular-nums select-none",
        critical
          ? "border-red-500/40 bg-red-500/10 text-red-300"
          : urgent
            ? "border-amber-500/35 bg-amber-500/10 text-amber-300"
            : "border-white/[0.08] bg-[#141416] text-zinc-300",
        className
      )}
      title="Time remaining on your access session"
      aria-live="polite"
      aria-label={`Session expires in ${formatRemaining(remaining)}`}
    >
      <Clock
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          critical ? "text-red-400" : urgent ? "text-amber-400" : "text-[#F8B400]"
        )}
        aria-hidden
      />
      <span className="hidden sm:inline text-[10px] uppercase tracking-wider font-bold opacity-70">
        Session
      </span>
      <span>{formatRemaining(remaining)}</span>
    </div>
  );
}
