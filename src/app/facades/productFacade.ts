import { useAuth, getEffectivePrice } from '../context/AuthContext';
import type { Product } from '../data';

export function useProducts() {
  const { adminProducts, discountRules, setAdminProducts } = useAuth();
  return { products: adminProducts, discountRules, setProducts: setAdminProducts };
}

export function useFeaturedProducts(count = 4): { product: Product; effectivePrice: number }[] {
  const { adminProducts, discountRules } = useAuth();
  return adminProducts.slice(0, count).map(p => ({
    product: p,
    effectivePrice: getEffectivePrice(p, discountRules),
  }));
}
