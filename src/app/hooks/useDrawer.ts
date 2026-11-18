import { useState } from 'react';

/**
 * Gestiona el estado de un panel deslizante (drawer) de edición.
 *
 * COMPOSABLE: encapsula la triada open/close/editing que se repite en
 * ProductsTab, CoursesTab y UsersTab. Centralizar aquí evita duplicar
 * tres useState por cada tab y garantiza que el item editado siempre
 * se limpie al cerrar.
 *
 * MOBILE-FIRST: el drawer ocupa 100 % del ancho en móvil (max-w-md
 * actúa solo en sm+). Este hook no tiene opinión sobre estilos, pero
 * expone `isOpen` para que el componente aplique la transición correcta
 * sin lógica extra.
 */
export function useDrawer<T = null>() {
  const [isOpen, setIsOpen] = useState(false);
  const [item, setItem] = useState<T | null>(null);

  const open = (editItem?: T | null) => {
    setItem(editItem ?? null);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setItem(null);
  };

  return { isOpen, item, open, close } as const;
}
