'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackVisit } from '@/lib/visitorTracker';

/**
 * Mount once in the B2C layout. Records a rich visit beacon on first paint
 * and on every client-side route change.
 */
export default function VisitorAnalytics() {
  const pathname = usePathname();
  const booted = useRef(false);

  useEffect(() => {
    // Defer slightly so Performance paint entries have a chance to land
    const delay = booted.current ? 0 : 800;
    booted.current = true;
    const t = window.setTimeout(() => {
      void trackVisit(pathname || '/');
    }, delay);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    let lastVisibleAt = 0;
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastVisibleAt < 30_000) return;
      lastVisibleAt = now;
      void trackVisit(window.location.pathname || '/');
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  return null;
}
