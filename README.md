# El Jardín de tu Salud — Frontend

Aplicación React y Vite migrada desde `TiaRichard`. Incluye tienda, carrito, cursos, perfil y panel de administración.

## Desarrollo

Requiere Node.js y npm.

```bash
npm ci
npm run dev
```

Para generar la versión de producción:

```bash
npm run build
```

El código principal está en `src/app/`, los estilos en `src/styles/` y las imágenes locales en `src/imports/`. Las notas de arquitectura están en `guidelines/`.

La aplicación conserva los datos y las fachadas locales del prototipo original. La conexión con el backend no forma parte de esta migración.
