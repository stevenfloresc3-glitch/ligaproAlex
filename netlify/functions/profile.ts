import { neon } from '@neondatabase/serverless';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { UserRole } from '../../src/types/tournament';

const DEFAULT_AUTH_BASE_URL = 'https://ep-purple-shape-bemthc5c.neonauth.c-9.us-east-2.aws.neon.tech/neondb/auth';
const allowedRoles = new Set<UserRole>(['publico', 'delegado', 'comisario', 'admin']);
let remoteJwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function getJwks() {
  if (remoteJwks) return remoteJwks;
  const baseUrl = (process.env.NEON_AUTH_BASE_URL || DEFAULT_AUTH_BASE_URL).replace(/\/$/, '');
  const jwksUrl = process.env.NEON_AUTH_JWKS_URL || `${baseUrl}/.well-known/jwks.json`;
  remoteJwks = createRemoteJWKSet(new URL(jwksUrl));
  return remoteJwks;
}

export default async function handler(request: Request) {
  if (request.method !== 'GET') {
    return Response.json({ error: 'Método no permitido' }, { status: 405 });
  }

  const authorization = request.headers.get('authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return Response.json({ error: 'Sesión requerida' }, { status: 401 });
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return Response.json({ error: 'DATABASE_URL no está configurada' }, { status: 503 });
  }

  try {
    const authBaseUrl = process.env.NEON_AUTH_BASE_URL || DEFAULT_AUTH_BASE_URL;
    const { payload } = await jwtVerify(token, getJwks(), {
      issuer: new URL(authBaseUrl).origin,
      algorithms: ['EdDSA'],
    });
    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
      return Response.json({ error: 'Sesión no válida' }, { status: 401 });
    }

    const sql = neon(connectionString);
    const rows = await sql`SELECT role FROM public.app_user_roles WHERE user_id = ${payload.sub} LIMIT 1`;
    const role = rows[0]?.role;
    const safeRole = typeof role === 'string' && allowedRoles.has(role as UserRole)
      ? role as UserRole
      : 'publico';

    return Response.json({ role: safeRole }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return Response.json(
      { error: 'No fue posible validar la sesión o consultar el rol' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
