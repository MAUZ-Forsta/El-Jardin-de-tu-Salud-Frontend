import { usePromotionContext } from '../context/PromotionContext';
import type { PromoBannerConfig } from '../context/PromotionContext';

export type { PromoBannerConfig };

export function usePromotion() {
  const { banner, updateBanner } = usePromotionContext();
  return {
    banner,
    isVisible: banner.isActive,
    updateBanner,
    activate:     () => updateBanner({ isActive: true }),
    deactivate:   () => updateBanner({ isActive: false }),
    setDiscount:  (discount: number) => updateBanner({ discount }),
    setHeadline:  (headline: string) => updateBanner({ headline }),
  };
}
