# LigaPro Ecuador

Aplicación React + TypeScript + Vite basada en los diseños exportados desde Stitch. Incluye panel, posiciones, fixture, clubes, estadísticas y actas. Los escudos están en `public/logos`.

## Iniciar localmente

1. Instala Node.js 22 o posterior.
2. Ejecuta `npm install`.
3. Copia `.env.example` a `.env` y configura `DATABASE_URL` con una cadena de conexión de Neon de solo lectura.
4. Ejecuta `npx netlify dev` para probar frontend y Netlify Functions juntos.

Sin `DATABASE_URL`, la interfaz abre en modo DEMO con datos de ejemplo. Las escrituras y la autenticación todavía no están habilitadas.

## Netlify

Conecta el repositorio en Netlify, define la variable de entorno `DATABASE_URL` en la configuración del sitio y publica con `npm run build` y directorio `dist`. La función pública `/.netlify/functions/data` lee clubes, tabla acumulada y partidos desde Neon. `netlify.toml` define la ruta `/api/data` y el fallback de la SPA.

Usa un rol de base de datos con permisos de lectura limitados. Nunca agregues la cadena de conexión al frontend, a variables `VITE_*` ni al repositorio. No uses `users.password` para autenticar: falta integrar un proveedor de autenticación y proteger las acciones por rol.

## Material de diseño

El diseño general parte de `ligapro-ecuador-—-gestión-oficial (1).zip`. Los diseños adicionales deben incorporarse por pantalla evitando duplicar componentes o sobrescribir el proyecto base.
