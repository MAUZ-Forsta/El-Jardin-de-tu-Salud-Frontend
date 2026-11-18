import { useState, useMemo } from 'react';

/**
 * Búsqueda + filtro genérico sobre una lista de items.
 *
 * COMPOSABLE: Shop, ProductsTab y CoursesTab repiten la misma estructura
 * de `query` + `filter`. Al generalizarlo con un predicado pasado como
 * parámetro, cada llamador define su propia lógica de matching sin
 * duplicar el useState ni el useMemo.
 *
 * Se usa `useMemo` en lugar de recalcular en render porque las listas
 * de productos/cursos pueden crecer y la búsqueda sobre strings es O(n).
 *
 * MOBILE-FIRST: el campo de búsqueda ocupa 100 % del ancho en móvil
 * (`flex-1`). El estado de búsqueda se mantiene aquí para que el
 * componente solo se encargue del layout responsivo, no de la lógica.
 */
export function useSearch<T>(
  items: T[],
  predicate: (item: T, query: string, filter: string) => boolean,
  initialFilter = 'todas'
) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(initialFilter);

  const filtered = useMemo(
    () => (query || filter !== initialFilter)
      ? items.filter(item => predicate(item, query, filter))
      : items,
    [items, query, filter, predicate, initialFilter]
  );

  return { query, setQuery, filter, setFilter, filtered } as const;
}
