# Perfil de usuario

El perfil editable guarda el nombre visible, un avatar prediseñado y el equipo favorito en `public.app_user_profiles`. La identidad se obtiene del JWT firmado por Neon Auth; el endpoint no acepta un `user_id` enviado por el navegador. El club favorito referencia `public.clubs(id)`.

## Configuración

1. Ejecuta `db/migrations/002_user_profiles.sql` en Neon SQL Editor, sobre la rama usada por Netlify. También asegura la tabla de roles y vuelve a asignar el administrador inicial `stevenfloresc3@gmail.com`; es compatible con haber ejecutado antes la migración 001.
2. Publica el código en Netlify y entra a **Mi perfil y roles**. Escoge un avatar, escribe un nombre visible, selecciona el equipo y guarda.

La foto real subida desde el dispositivo no está incluida: esta versión ofrece avatares listos, sin requerir almacenamiento de archivos.
