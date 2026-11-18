import { useState, useRef, useCallback } from 'react';

/**
 * Rastrea si un formulario tiene cambios sin guardar comparando el
 * estado actual contra el snapshot inicial serializado.
 *
 * COMPOSABLE: la lógica dirty-check con JSON.stringify + useRef se
 * repetía idéntica en ProductForm y CourseForm. Extraerla aquí permite
 * reutilizarla en cualquier formulario futuro (UserProfile, Settings)
 * sin copiar lógica.
 *
 * Por qué JSON.stringify: los formularios de este proyecto tienen campos
 * escalares, arrays de strings y booleans — todos serializables sin
 * pérdida. Para objetos con Date o funciones se debería usar una librería
 * de deep-equal, pero no existe esa necesidad aquí.
 *
 * MOBILE-FIRST: la UI del indicador "Sin guardar" y la confirmación de
 * descarte son responsabilidad del componente; este hook solo expone el
 * booleano `isDirty` y el setter tipado `set`.
 */
export function useDirtyForm<T extends Record<string, unknown>>(initial: T) {
  const snapshotRef = useRef(JSON.stringify(initial));
  const [form, setForm] = useState<T>(initial);

  const set = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    const parsed = JSON.parse(snapshotRef.current) as T;
    setForm(parsed);
  }, []);

  const isDirty = JSON.stringify(form) !== snapshotRef.current;

  return { form, set, isDirty, reset } as const;
}
