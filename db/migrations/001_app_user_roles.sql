-- Roles de LigaPro: no son los roles de conexión de PostgreSQL.
-- Ejecuta este script en Neon SQL Editor sobre la rama production.
BEGIN;

CREATE TABLE IF NOT EXISTS public.app_user_roles (
  user_id TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'publico'
    CHECK (role IN ('publico', 'delegado', 'comisario', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

REVOKE ALL ON TABLE public.app_user_roles FROM PUBLIC;

-- Asignación inicial del administrador elegido por el propietario.
-- Si la cuenta todavía no existe en Neon Auth, esta sentencia no insertará filas.
INSERT INTO public.app_user_roles (user_id, role)
SELECT id, 'admin'
FROM neon_auth."user"
WHERE LOWER(email) = LOWER('stevenfloresc3@gmail.com')
ON CONFLICT (user_id) DO UPDATE
SET role = EXCLUDED.role,
    updated_at = NOW();

COMMIT;

-- Verifica que la cuenta quedó con el rol esperado. Si no devuelve filas,
-- confirma que el correo ya exista en Neon Auth y corrige el correo arriba.
SELECT u.email, r.role
FROM public.app_user_roles AS r
JOIN neon_auth."user" AS u ON u.id = r.user_id
WHERE LOWER(u.email) = LOWER('stevenfloresc3@gmail.com');
