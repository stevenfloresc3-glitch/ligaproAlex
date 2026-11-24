# Guía del proyecto

## Comandos

- `npm install`: instala dependencias.
- `npm run dev`: inicia Vite.
- `npx netlify dev`: inicia Vite y Netlify Functions en local.
- `npm run build`: genera `dist` para Netlify.
- `npm run lint`: comprueba TypeScript.

## Reglas de trabajo

- React + TypeScript + Vite + Tailwind. Mantener las pantallas basadas en Stitch y los logos bajo `public/logos`.
- La base es Neon/PostgreSQL. Las consultas van en `netlify/functions`; el navegador nunca recibe `DATABASE_URL`.
- Consultas públicas de solo lectura y con tablas/vistas existentes. No interpolar SQL con datos de usuario.
- Los datos de ejemplo deben seguir marcados como DEMO. No presentar valores de muestra como oficiales.
- No usar la tabla `users.password` ni añadir autenticación propia con contraseñas almacenadas.
- Antes de cambios de esquema, autenticación o permisos, documentar el supuesto. No ejecutar escrituras sobre la base de producción.
- Reglas de negocio siguen el SRS; cuando contradiga el esquema real de Neon, señalarlo antes de inventar columnas o funciones.
