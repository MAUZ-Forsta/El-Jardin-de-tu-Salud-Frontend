import { useCallback } from 'react';

/**
 * Lee un File del sistema y lo convierte en una data-URL via FileReader.
 *
 * COMPOSABLE: ImageUploader necesita esta lógica; en el futuro
 * UserProfile (avatar) y cualquier otro uploader también la necesitarán.
 * Extraerla evita duplicar el manejo de FileReader y el chequeo de tipo
 * MIME.
 *
 * MOBILE-FIRST: en dispositivos móviles el input[type=file] abre la
 * cámara o la galería según el atributo `capture`. Este hook no gestiona
 * el input directamente (eso corresponde al componente), pero garantiza
 * que cualquier File válido se procese de la misma manera sin importar
 * la fuente (drag-drop en escritorio, galería en móvil).
 */
export function useLocalImage(onResult: (dataUrl: string) => void) {
  const read = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result;
      if (typeof result === 'string') onResult(result);
    };
    reader.readAsDataURL(file);
  }, [onResult]);

  return { read } as const;
}
