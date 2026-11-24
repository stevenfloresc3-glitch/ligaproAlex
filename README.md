# LigaPro Ecuador

Aplicación React + TypeScript + Vite basada en los diseños exportados desde Stitch. Incluye panel, posiciones, fixture, clubes, estadísticas y actas. Los escudos están en `public/logos`.

## Iniciar localmente

1. Instala Node.js 22 o posterior.
2. Ejecuta `npm install`.
3. Copia `.env.example` a `.env.local` y configura `DATABASE_URL` con una cadena de conexión de Neon de solo lectura. El endpoint público de Neon Auth ya está definido como valor predeterminado; puedes sobrescribirlo con `VITE_NEON_AUTH_URL` si usas otra rama o proyecto.
4. Ejecuta `npx netlify dev` para probar frontend y Netlify Functions juntos.

El contenido queda detrás del registro/inicio de sesión con Neon Managed Auth. Sin `DATABASE_URL`, luego de ingresar la interfaz usa datos DEMO. Agrega `http://localhost:3000` (Vite), `http://localhost:8888` (Netlify Dev) y el dominio de producción a los dominios permitidos de Neon Auth. El perfil muestra el rol actual y los roles de LigaPro disponibles; las cuentas nuevas son aficionado/solo consulta. Los permisos oficiales necesitan una autorización de servidor y asignación de rol. La tabla se ordena según puntos, diferencia y goles; los pronósticos y las apuestas usan créditos virtuales locales, sin dinero real.

## Netlify

Conecta el repositorio en Netlify, define `DATABASE_URL` y publica con `npm run build` y directorio `dist`. `VITE_NEON_AUTH_URL` es opcional: solo configúrala para sobrescribir el endpoint de Auth predeterminado. Añade el dominio HTTPS de Netlify a los dominios permitidos de Neon Auth. La función pública `/.netlify/functions/data` lee clubes, tabla acumulada y partidos desde Neon. `netlify.toml` define la ruta `/api/data` y el fallback de la SPA.

Usa un rol de base de datos con permisos de lectura limitados. Nunca agregues la cadena de conexión al frontend, a variables `VITE_*` ni al repositorio. El inicio de sesión no concede permisos administrativos: protege cualquier escritura en el servidor y valida allí los roles antes de habilitar gestión oficial.

## Material de diseño

El diseño general parte de `ligapro-ecuador-—-gestión-oficial (1).zip`. Los diseños adicionales deben incorporarse por pantalla evitando duplicar componentes o sobrescribir el proyecto base.
