# Arquitectura del Proyecto — Mobile-First + Composables

## Por qué mobile-first

El comercio natural tiene una audiencia predominantemente móvil (compras impulsivas, consulta de beneficios de plantas, inscripción a cursos entre actividades). Diseñar mobile-first garantiza que la experiencia base sea la más restrictiva en espacio y ancho de banda; el escritorio amplía, no corrige.

**Regla de breakpoints (Tailwind v4):**

| Prefijo | Ancho mínimo | Uso |
|---------|-------------|-----|
| *(base)* | 0 px | Móvil: tarjetas apiladas, texto compacto, drawers full-screen |
| `sm:` | 640 px | Tablet: tablas, sidebars, grids de 2 columnas |
| `lg:` | 1024 px | Desktop: sidebar fija del admin, grids de 4 columnas |

---

## Por qué composables (custom hooks)

En React, un *composable* es un custom hook que encapsula un fragmento reutilizable de lógica con estado. La misma lógica de "abrir un drawer" aparece en ProductsTab, CoursesTab y UsersTab — sin composables, ese bloque de tres `useState` se copia-pega y cualquier corrección debe aplicarse en tres lugares. Los composables eliminan esa deuda técnica y hacen los componentes más legibles porque su cuerpo describe *qué hace* la tab, no *cómo implementa* cada detalle.

---

## Módulos y justificación

### `src/app/hooks/useDrawer.ts`

**Qué hace:** gestiona el estado de un panel lateral (drawer): si está abierto, qué ítem se está editando, y las acciones `open(item?)` / `close()`.

**Por qué composable:** tres tabs del admin (Productos, Cursos, Usuarios) tenían el mismo trío de `useState`: `drawerOpen`, `editing`, `setEditing`. Extraerlo en un hook tipado con genérico `useDrawer<T>` evita duplicación y centraliza cualquier extensión futura (p.ej. animación de entrada, historial de edición).

**Por qué mobile-first importa aquí:** en móvil el drawer ocupa el 100 % de la pantalla; en sm+ se limita a `max-w-md`. El hook no decide el layout visual, pero al ser el único punto de control de `isOpen` facilita agregar `body { overflow: hidden }` mientras el drawer está abierto, esencial en móvil para evitar scroll doble.

---

### `src/app/hooks/useDirtyForm.ts`

**Qué hace:** toma un valor inicial, guarda un snapshot `JSON.stringify` en un `useRef` (sin causar re-renders) y expone `isDirty` como comparación lazy en cada render. Provee `set(key, value)` para actualizar campos individualmente.

**Por qué composable:** el guard de "cambios sin guardar" es idéntico en ProductForm y CourseForm. Sin el hook, ambos componentes tenían su propio `useRef` de snapshot y su propia lógica de comparación — código idéntico en dos lugares. Cualquier ajuste (p.ej. ignorar campos volátiles como timestamps) se haría una sola vez.

**Por qué mobile-first importa aquí:** en móvil los botones Cancelar/Guardar están fijos al fondo de la pantalla y son los primeros (o únicos) controles visibles sin scroll. Mostrar el badge "Sin guardar" junto al título del drawer y colorear el botón Cancelar en ámbar comunica el estado sucio de forma prominente sin necesidad de expandir el viewport.

---

### `src/app/hooks/useDeleteConfirm.ts`

**Qué hace:** implementa double-confirm para borrar: `request(id)` marca el ítem como pendiente, `confirm(id, onDelete)` ejecuta el borrado, `cancel()` limpia. `isPending(id)` permite al componente renderizar botones de confirmación inline.

**Por qué composable:** el patrón doble-confirmación es idéntico en todas las tabs. Sin el hook, cada tab tenía `const [pendingId, setPendingId] = useState<string | null>(null)` con su propio handler. Con el hook, cada tab importa `useDeleteConfirm()` y obtiene la API completa.

**Por qué mobile-first importa aquí:** en pantallas táctiles los botones de eliminar son pequeños y fáciles de activar accidentalmente. El double-confirm previene borrados destructivos irreversibles. La confirmación inline (dentro de la tarjeta del ítem, no en un modal separado) evita que un modal overlay tape toda la pantalla en móvil.

---

### `src/app/hooks/useSearch.ts`

**Qué hace:** acepta una lista de ítems `T[]` y un predicado `(item, query, filter) => boolean`, devuelve `{ query, setQuery, filter, setFilter, filtered }`. Usa `useMemo` para no re-filtrar si los inputs no cambiaron.

**Por qué composable:** la búsqueda aparece en ProductsTab, CoursesTab y (en el futuro) UsersTab. El predicado específico de cada tab (buscar en `name + category` vs `title + instructor`) se pasa como parámetro — el hook no asume campos concretos, es completamente genérico.

**Por qué mobile-first importa aquí:** en móvil el campo de búsqueda ocupa el ancho completo y se muestra antes de la lista. `useMemo` garantiza que el filtrado no bloquee el hilo principal mientras el usuario tipea en un dispositivo de gama media.

---

### `src/app/hooks/useDiscountPrice.ts`

**Qué hace:** dado `basePrice`, `discountEnabled`, `discountId` y las reglas globales, calcula `activeRule`, `computedPrice` y `discountLabel`. Todo con `useMemo` para minimizar recálculos durante la edición del formulario.

**Por qué composable:** la fórmula de precio efectivo se necesita en tres contextos: el preview en tiempo real dentro del formulario de edición (pre-save), las tarjetas de lista del admin y la tienda de usuario. Sin el hook, cada lugar re-implementaba `Math.max(0, base * (1 - value/100))`.

**Complemento de `getEffectivePrice`:** esa función pura en `AuthContext` trabaja sobre un `Product` ya persistido. `useDiscountPrice` trabaja con los valores del formulario *en vuelo* durante la edición — las dos capas son complementarias, no redundantes.

**Por qué mobile-first importa aquí:** el preview de precio se muestra como un banner condensado de una fila en móvil (precio base → precio final → badge de descuento). El hook devuelve números; el componente decide el formato visual según breakpoint.

---

### `src/app/hooks/useLocalImage.ts`

**Qué hace:** envuelve `FileReader.readAsDataURL` en un callback estable (`useCallback`) que llama a `onResult(dataUrl)` cuando la lectura termina.

**Por qué composable:** cualquier uploader de imagen (productos, cursos, avatares de usuario) necesita esta misma lógica de FileReader. Centralizar evita copiar el `reader.onload` y el chequeo de `file.type.startsWith('image/')` en cada componente.

**Por qué mobile-first importa aquí:** en móvil el `<input type="file" accept="image/*">` abre la cámara o la galería según el dispositivo. El hook no gestiona el input directamente (responsabilidad del componente), pero garantiza que cualquier `File` válido — ya sea de drag-drop en escritorio o de cámara en móvil — se procese de forma idéntica.

---

### `src/app/components/ImageUploader.tsx`

**Qué hace:** componente de doble modo (archivo local / URL). Usa `useLocalImage` para el procesamiento del archivo. Expone drop zone con drag-and-drop y preview con botón de limpieza.

**Por qué mobile-first importa aquí:** el texto del drop zone dice "Toca para seleccionar" (no "Click o arrastra") porque en móvil no hay drag-and-drop. En sm+ se añade la instrucción de arrastrar.

---

### `src/app/context/AuthContext.tsx`

**Qué hace:** proveedor global que centraliza `adminProducts`, `discountRules` y la función pura `getEffectivePrice(product, rules)`.

**Por qué centralizar productos aquí:** mover los productos al contexto permite que la tienda (Shop, Home) vea en tiempo real los cambios de precio/descuento que el admin aplica, sin necesitar un backend. Es la capa de "estado compartido" que reemplaza a Redux en este proyecto.

**Por qué mobile-first importa aquí:** la tienda y el admin comparten productos en el mismo proceso de browser. En móvil, el admin puede abrir la tienda en otra pestaña y ver los cambios de precio reflejados inmediatamente (mismo contexto React si se usa una SPA sin recarga).

---

### `src/app/components/admin/tabs/ProductsTab.tsx` y `CoursesTab.tsx`

**Qué hacen:** CRUD completo de productos/cursos con búsqueda, drawer de edición, double-confirm de borrado y gestión de descuentos.

**Por qué composables:** ambas tabs son estructuralmente idénticas. Cada una usa `useDrawer`, `useDeleteConfirm`, `useSearch`, y dentro del formulario `useDirtyForm` + `useDiscountPrice`. La diferencia es solo el tipo de dato (`Product` vs `Course`) y el color de acento (`#1b5e20` verde / `#e07820` naranja).

**Patrón mobile-first:**
- Base: tarjetas compactas (imagen + nombre + precio + badge) con acciones en fila compacta.
- `sm:` (tabla): columnas adicionales (stock, instructor, estudiantes) se muestran solo cuando hay espacio.
- Drawer: `w-full` en móvil, `max-w-md` en sm+.
- Footer de formulario: `shrink-0` fijo al fondo del drawer (no se puede perder el botón Guardar por scroll).

---

### `src/app/components/admin/tabs/SettingsTab.tsx`

**Qué hace:** gestiona las reglas de descuento globales (CRUD con double-confirm) y aloja el botón de logout en móvil.

**Por qué logout en SettingsTab (no en el header):** en móvil el header del admin no muestra texto ni logo para ahorrar espacio vertical. El logout es una acción infrecuente; moverla a Configuración sigue el patrón de iOS/Android donde las acciones destructivas o de sesión viven en "Ajustes".

---

### `src/app/components/Home.tsx` y `Shop.tsx`

**Qué hacen:** vistas de usuario que muestran productos con precios efectivos (descuentos aplicados).

**Por qué `adminProducts` del contexto:** los productos en la vista de usuario deben reflejar los cambios del admin en tiempo real. Importar `products` estático de `data.ts` mostraría precios desactualizados. Ambos componentes leen `adminProducts` y aplican `getEffectivePrice(product, discountRules)` para mostrar el precio final al comprador.

---

## Resumen de capas

```
src/
├── app/
│   ├── context/
│   │   ├── AuthContext.tsx      — Estado global: productos, reglas, usuario
│   │   └── CartContext.tsx      — Estado del carrito
│   ├── hooks/                   — Composables reutilizables
│   │   ├── useDrawer.ts
│   │   ├── useDirtyForm.ts
│   │   ├── useDeleteConfirm.ts
│   │   ├── useSearch.ts
│   │   ├── useDiscountPrice.ts
│   │   ├── useLocalImage.ts
│   │   └── index.ts             — Barrel export
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminPanel.tsx   — Shell del panel admin (routing de tabs)
│   │   │   └── tabs/            — Cada tab es un módulo independiente
│   │   └── *.tsx                — Vistas públicas (Home, Shop, Courses…)
│   └── data.ts                  — Tipos e iniciales estáticos
```

**Flujo de datos:**
```
data.ts (inicial) → AuthContext (runtime) → Admin tabs (escritura)
                                          ↓
                                    Home / Shop (lectura con getEffectivePrice)
```
