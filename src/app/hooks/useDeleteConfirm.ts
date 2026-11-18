import { useState } from 'react';

/**
 * Implementa el patrón de eliminación en dos pasos (double-confirm).
 *
 * COMPOSABLE: el patrón "primer toque pide confirmación, segundo toque
 * ejecuta, tercero cancela" se usa en ProductsTab, CoursesTab y
 * UsersTab. Este hook lo encapsula para que los componentes solo
 * pregunten `isPending(id)` y llamen `request(id)` / `cancel()` / `confirm(id, fn)`.
 *
 * MOBILE-FIRST: en móvil los objetivos táctiles son pequeños; el
 * double-confirm evita eliminaciones accidentales por taps mal dirigidos,
 * algo crítico cuando los botones miden 36 × 36 px.
 */
export function useDeleteConfirm() {
  const [pendingId, setPendingId] = useState<string | null>(null);

  const request = (id: string) => setPendingId(id);
  const cancel = () => setPendingId(null);
  const isPending = (id: string) => pendingId === id;

  const confirm = (id: string, onDelete: (id: string) => void) => {
    if (pendingId === id) {
      onDelete(id);
      setPendingId(null);
    }
  };

  return { request, cancel, isPending, confirm } as const;
}
