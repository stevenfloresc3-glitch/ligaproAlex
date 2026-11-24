-- Perfil editable y equipo favorito asociado al usuario de Neon Auth.
-- Ejecuta este archivo en Neon SQL Editor, en la misma rama que usa la app.
BEGIN;

-- Asegura la tabla de roles usada por el endpoint /api/profile.
-- Si ya aplicaste 001_app_user_roles.sql, esta parte es idempotente.
CREATE TABLE IF NOT EXISTS public.app_user_roles (
  user_id TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'publico'
    CHECK (role IN ('publico', 'delegado', 'comisario', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

REVOKE ALL ON TABLE public.app_user_roles FROM PUBLIC;

CREATE TABLE IF NOT EXISTS public.app_user_profiles (
  user_id TEXT PRIMARY KEY,
  display_name VARCHAR(60),
  avatar_id TEXT NOT NULL DEFAULT 'ball'
    CHECK (avatar_id IN ('ball', 'lion', 'eagle', 'glove', 'star', 'fire')),
  favorite_club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

REVOKE ALL ON TABLE public.app_user_profiles FROM PUBLIC;

-- Vuelve a asegurar el primer administrador. No modifica otras cuentas.
INSERT INTO public.app_user_roles (user_id, role)
SELECT id, 'admin'
FROM neon_auth."user"
WHERE LOWER(email) = LOWER('stevenfloresc3@gmail.com')
ON CONFLICT (user_id) DO UPDATE
SET role = EXCLUDED.role,
    updated_at = NOW();

COMMIT;

SELECT u.email, r.role
FROM public.app_user_roles AS r
JOIN neon_auth."user" AS u ON u.id::text = r.user_id
WHERE LOWER(u.email) = LOWER('stevenfloresc3@gmail.com');
