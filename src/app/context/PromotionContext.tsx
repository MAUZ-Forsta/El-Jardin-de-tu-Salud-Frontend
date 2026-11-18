import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface PromoBannerConfig {
  isActive: boolean;
  headline: string;
  discount: number;
  subtext: string;
  ctaLabel: string;
  ctaLink: string;
}

const DEFAULT_CONFIG: PromoBannerConfig = {
  isActive: true,
  headline: 'Tés, plantas e infusiones',
  discount: 20,
  subtext: 'Toda la colección de temporada. Sin código necesario.',
  ctaLabel: 'Ver productos',
  ctaLink: '/tienda',
};

const STORAGE_KEY = 'promo_banner_config';

function loadConfig(): PromoBannerConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_CONFIG;
}

interface PromotionCtx {
  banner: PromoBannerConfig;
  updateBanner: (updates: Partial<PromoBannerConfig>) => void;
}

const PromotionContext = createContext<PromotionCtx | null>(null);

export function PromotionProvider({ children }: { children: ReactNode }) {
  const [banner, setBanner] = useState<PromoBannerConfig>(loadConfig);

  const updateBanner = (updates: Partial<PromoBannerConfig>) => {
    setBanner(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <PromotionContext.Provider value={{ banner, updateBanner }}>
      {children}
    </PromotionContext.Provider>
  );
}

export function usePromotionContext() {
  const ctx = useContext(PromotionContext);
  if (!ctx) throw new Error('usePromotionContext must be used within PromotionProvider');
  return ctx;
}
