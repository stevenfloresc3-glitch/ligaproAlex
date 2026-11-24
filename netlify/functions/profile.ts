import { neon } from '@neondatabase/serverless';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { PROFILE_AVATARS, ProfileAvatarId } from '../../src/types/profile';
import type { UserRole } from '../../src/types/tournament';

const DEFAULT_AUTH_BASE_URL = 'https://ep-purple-shape-bemthc5c.neonauth.c-9.us-east-2.aws.neon.tech/neondb/auth';
const allowedRoles = new Set<UserRole>(['publico', 'delegado', 'comisario', 'admin']);
const allowedAvatarIds = new Set<ProfileAvatarId>(PROFILE_AVATARS.map((avatar) => avatar.id));
let remoteJwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function getJwks() {
  if (remoteJwks) return remoteJwks;
  const baseUrl = (process.env.NEON_AUTH_BASE_URL || DEFAULT_AUTH_BASE_URL).replace(/\/$/, '');
  const jwksUrl = process.env.NEON_AUTH_JWKS_URL || `${baseUrl}/.well-known/jwks.json`;
  remoteJwks = createRemoteJWKSet(new URL(jwksUrl));
  return remoteJwks;
}

async function authenticate(request: Request) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;

  const authBaseUrl = process.env.NEON_AUTH_BASE_URL || DEFAULT_AUTH_BASE_URL;
  const { payload } = await jwtVerify(token, getJwks(), {
    issuer: new URL(authBaseUrl).origin,
    algorithms: ['EdDSA'],
  });
  return typeof payload.sub === 'string' && payload.sub.length > 0 ? payload.sub : null;
}

async function getProfile(sql: NeonQueryFunction<false, false>, userId: string) {
  const rows = await sql`
    SELECT
      COALESCE(roles.role, 'publico') AS role,
      profiles.display_name AS "displayName",
      COALESCE(profiles.avatar_id, 'ball') AS "avatarId",
      profiles.favorite_club_id::text AS "favoriteClubId"
    FROM (SELECT ${userId}::text AS user_id) AS current_user
    LEFT JOIN public.app_user_roles AS roles ON roles.user_id::text = current_user.user_id
    LEFT JOIN public.app_user_profiles AS profiles ON profiles.user_id::text = current_user.user_id
  `;
  const row = rows[0];
  const role = row?.role;
  return {
    role: typeof role === 'string' && allowedRoles.has(role as UserRole) ? role as UserRole : 'publico',
    profile: {
      displayName: typeof row?.displayName === 'string' ? row.displayName : '',
      avatarId: typeof row?.avatarId === 'string' && allowedAvatarIds.has(row.avatarId as ProfileAvatarId)
        ? row.avatarId as ProfileAvatarId
        : 'ball',
      favoriteClubId: typeof row?.favoriteClubId === 'string' ? row.favoriteClubId : '',
    },
  };
}

export default async function handler(request: Request) {
  if (!['GET', 'POST'].includes(request.method)) {
    return Response.json({ error: 'Método no permitido' }, { status: 405 });
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return Response.json({ error: 'DATABASE_URL no está configurada' }, { status: 503 });
  }

  let userId: string | null;
  try {
    userId = await authenticate(request);
  } catch {
    return Response.json(
      { error: 'Neon Auth no pudo validar la sesión. Cierra sesión e inicia otra vez.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  if (!userId) {
    return Response.json({ error: 'Sesión no válida. Cierra sesión e inicia otra vez.' }, { status: 401 });
  }

  try {
    const sql = neon(connectionString);

    if (request.method === 'POST') {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return Response.json({ error: 'El perfil enviado no es válido' }, { status: 400 });
      }
      if (typeof body !== 'object' || body === null) {
        return Response.json({ error: 'El perfil enviado no es válido' }, { status: 400 });
      }

      const input = body as Record<string, unknown>;
      const displayName = typeof input.displayName === 'string' ? input.displayName.trim() : '';
      const avatarId = input.avatarId;
      const favoriteClubId = input.favoriteClubId;
      if (displayName.length > 60) {
        return Response.json({ error: 'El nombre debe tener 60 caracteres o menos' }, { status: 400 });
      }
      if (typeof avatarId !== 'string' || !allowedAvatarIds.has(avatarId as ProfileAvatarId)) {
        return Response.json({ error: 'Selecciona un avatar válido' }, { status: 400 });
      }
      const isUuid = typeof favoriteClubId === 'string'
        && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(favoriteClubId);
      if (favoriteClubId !== null && !isUuid) {
        return Response.json({ error: 'Selecciona un equipo válido' }, { status: 400 });
      }

      await sql`
        INSERT INTO public.app_user_profiles (user_id, display_name, avatar_id, favorite_club_id)
        VALUES (${userId}, ${displayName || null}, ${avatarId}, ${favoriteClubId})
        ON CONFLICT (user_id) DO UPDATE SET
          display_name = EXCLUDED.display_name,
          avatar_id = EXCLUDED.avatar_id,
          favorite_club_id = EXCLUDED.favorite_club_id,
          updated_at = NOW()
      `;
    }

    const profile = await getProfile(sql, userId);

    return Response.json(profile, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (cause) {
    console.error('LigaPro profile query failed:', cause instanceof Error ? cause.message : 'Unknown database error');
    return Response.json(
      { error: 'Neon Auth validó tu sesión, pero falló la consulta del perfil o rol en la base. Revisa que las tablas de perfil y roles existan en la rama production.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
