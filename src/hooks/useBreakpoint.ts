import { useState, useEffect } from 'react';

function getBreakpoint() {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1280;
  return {
    isMobile: w < 768,
    isTablet: w >= 768 && w < 1024,
    isDesktop: w >= 1024,
    isNarrow: w < 1024,
    width: w,
  };
}

export type Breakpoint = ReturnType<typeof getBreakpoint>;

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(getBreakpoint);

  useEffect(() => {
    const handler = () => setBp(getBreakpoint());
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, []);

  return bp;
}
