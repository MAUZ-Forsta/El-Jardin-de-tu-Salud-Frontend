import { useMemo } from 'react';
import type { DiscountRule } from '../context/AuthContext';

/**
 * Calcula el precio efectivo de un item dado un conjunto de reglas de
 * descuento activas en el contexto global.
 *
 * COMPOSABLE: la lógica de precio efectivo (base, regla, resultado) se
 * necesita en el formulario de edición (preview en tiempo real), en las
 * tarjetas de lista del admin y en la vista de la tienda. Centralizar
 * aquí garantiza que un cambio en la fórmula de descuento se propague
 * a todos los puntos sin editar múltiples archivos.
 *
 * Por qué no usar solo `getEffectivePrice` de AuthContext: esa función
 * pura trabaja sobre un producto ya guardado. Este hook trabaja con
 * valores del formulario *en vuelo* (basePrice como number, activeRule
 * como objeto parcial) durante la edición. Las dos capas son
 * complementarias.
 *
 * MOBILE-FIRST: el preview de precio se muestra como un banner
 * condensado de una sola fila en móvil. El hook devuelve valores
 * numéricos; el componente decide el formato visual según breakpoint.
 */
export function useDiscountPrice(
  basePrice: number,
  discountEnabled: boolean,
  discountId: string | undefined,
  rules: DiscountRule[]
) {
  const activeRule = useMemo(
    () => (discountEnabled && discountId)
      ? rules.find(r => r.id === discountId) ?? null
      : null,
    [discountEnabled, discountId, rules]
  );

  const computedPrice = useMemo(() => {
    if (!activeRule || basePrice <= 0) return basePrice;
    return Math.max(
      0,
      activeRule.type === 'percentage'
        ? basePrice * (1 - activeRule.value / 100)
        : basePrice - activeRule.value
    );
  }, [activeRule, basePrice]);

  const discountLabel = activeRule
    ? activeRule.type === 'percentage'
      ? `−${activeRule.value}%`
      : `−$${activeRule.value}`
    : null;

  return { activeRule, computedPrice, discountLabel } as const;
}
