'use client';

import { useEffect, useState } from 'react';

import { BrandedLoader } from '@/components/feedback/branded-loader';

const SESSION_KEY = 'motormats-splash-seen';
const SPLASH_MS = 2200;

/** Full-screen branded overlay on first visit each session. */
export function AppLoadSplash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, '1');
      setVisible(true);
      const timer = window.setTimeout(() => setVisible(false), SPLASH_MS);
      return () => window.clearTimeout(timer);
    } catch {
      return undefined;
    }
  }, []);

  if (!visible) return null;

  return <BrandedLoader overlay rotateQuotes label="Loading Motormats" />;
}
