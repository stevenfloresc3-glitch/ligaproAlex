# Roles y permisos LigaPro

La identidad y las sesiones las administra Neon Auth. Los permisos propios de LigaPro viven en `public.app_user_roles`, vinculados por `user_id` al identificador `sub` del token firmado por Neon Auth.

El endpoint `/.netlify/functions/profile` valida el JWT contra la JWKS de Neon Auth y solo después consulta el rol del usuario autenticado. El navegador no envía un `user_id` para elegir qué rol consultar. Si no hay una fila asignada, el rol efectivo es `publico`.

## Puesta en marcha

1. Inicia sesión una vez con el correo que recibirá el rol.
2. En Neon, abre la rama `production` → **SQL Editor** y ejecuta `db/migrations/001_app_user_roles.sql`.
3. Comprueba que la sentencia de asignación inicial insertó una fila con rol `admin`. El correo inicial definido en el archivo es `stevenfloresc3@gmail.com`; cámbialo antes de ejecutar si la cuenta correcta es otra.
4. Publica el commit en Netlify. La app usa los valores de Neon Auth ya definidos para el cliente; puedes sobrescribirlos en Netlify con `NEON_AUTH_BASE_URL` y `NEON_AUTH_JWKS_URL` si el proyecto o rama cambian.

No se ejecutan cambios en la base de producción desde el código. El SQL anterior requiere ejecución explícita por el propietario del proyecto. El acceso administrativo visual no convierte las operaciones locales de la maqueta en escrituras oficiales persistentes; cada operación oficial futura debe tener su propio endpoint autenticado y autorización del lado del servidor.
