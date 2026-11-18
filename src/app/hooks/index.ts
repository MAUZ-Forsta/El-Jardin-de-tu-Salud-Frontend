/**
 * Barrel de hooks composables.
 *
 * Importar desde '@/hooks' o desde '../hooks' según la profundidad del
 * archivo consumidor. Mantener el barrel evita rutas relativas largas
 * (../../../../hooks/useDrawer) y facilita el tree-shaking ya que
 * cada hook es un módulo independiente.
 */
export { useDrawer }        from './useDrawer';
export { useDirtyForm }     from './useDirtyForm';
export { useDeleteConfirm } from './useDeleteConfirm';
export { useSearch }        from './useSearch';
export { useDiscountPrice } from './useDiscountPrice';
export { useLocalImage }    from './useLocalImage';
