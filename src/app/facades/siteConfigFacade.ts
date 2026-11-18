import { useSiteConfigContext } from '../context/SiteConfigContext';
import type { SocialLinks } from '../context/SiteConfigContext';

export type { SocialLinks };

export function useSiteConfig() {
  const { config, updateSocial } = useSiteConfigContext();
  return {
    social: config.social,
    updateSocial,
    activeSocials: Object.entries(config.social).filter(([, v]) => v.trim() !== '') as [keyof SocialLinks, string][],
  };
}
