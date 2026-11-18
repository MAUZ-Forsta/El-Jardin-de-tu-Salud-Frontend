import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface SocialLinks {
  youtube: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
}

export interface SiteConfig {
  social: SocialLinks;
}

const DEFAULT_CONFIG: SiteConfig = {
  social: {
    youtube: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    whatsapp: '',
  },
};

const STORAGE_KEY = 'site_config';

function loadConfig(): SiteConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_CONFIG;
}

interface SiteConfigCtx {
  config: SiteConfig;
  updateSocial: (social: Partial<SocialLinks>) => void;
}

const SiteConfigContext = createContext<SiteConfigCtx | null>(null);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(loadConfig);

  const updateSocial = (social: Partial<SocialLinks>) => {
    setConfig(prev => {
      const next = { ...prev, social: { ...prev.social, ...social } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <SiteConfigContext.Provider value={{ config, updateSocial }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfigContext() {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) throw new Error('useSiteConfigContext must be used within SiteConfigProvider');
  return ctx;
}
