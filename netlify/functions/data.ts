import { neon } from '@neondatabase/serverless';

export default async function handler() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return Response.json({ error: 'DATABASE_URL no está configurada' }, { status: 503 });
  }

  try {
    const sql = neon(connectionString);
    const [clubs, standings, matches] = await Promise.all([
      sql`
        SELECT c.id, c.name, c.short_name, c.logo_url, c.is_affiliate,
               st.name AS stadium, st.city
        FROM clubs c
        LEFT JOIN stadiums st ON st.id = c.home_stadium_id
        ORDER BY c.name
      `,
      sql`
        SELECT position, club_id, club_name, short_name, pj, pg, pe, pp, gf, gc, dg, pts
        FROM v_standings_cumulative
        WHERE tournament_id = (
          SELECT t.id FROM tournaments t
          JOIN seasons s ON s.id = t.season_id
          WHERE t.series = 'A'
          ORDER BY s.year DESC LIMIT 1
        )
        ORDER BY position
      `,
      sql`
        SELECT m.id, m.home_club_id, m.away_club_id, m.kickoff_at, m.status,
               m.home_goals, m.away_goals, r.number AS round_number,
               st.name AS stadium, st.city
        FROM matches m
        JOIN rounds r ON r.id = m.round_id
        JOIN phases p ON p.id = r.phase_id
        JOIN tournaments t ON t.id = p.tournament_id
        JOIN seasons s ON s.id = t.season_id
        LEFT JOIN stadiums st ON st.id = m.stadium_id
        WHERE t.series = 'A'
          AND s.year = (
            SELECT MAX(s2.year)
            FROM seasons s2
            JOIN tournaments t2 ON t2.season_id = s2.id
            WHERE t2.series = 'A'
          )
        ORDER BY m.kickoff_at NULLS LAST
        LIMIT 300
      `,
    ]);

    return Response.json({ clubs, standings, matches }, {
      headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60' },
    });
  } catch (cause) {
    const dbError = typeof cause === 'object' && cause !== null
      ? cause as { code?: unknown; message?: unknown; cause?: unknown }
      : null;
    const nestedError = typeof dbError?.cause === 'object' && dbError.cause !== null
      ? dbError.cause as { code?: unknown; message?: unknown }
      : null;
    const errorCode = typeof dbError?.code === 'string'
      ? dbError.code
      : typeof nestedError?.code === 'string' ? nestedError.code : 'UNKNOWN';
    const errorDetail = typeof dbError?.message === 'string'
      ? dbError.message
      : typeof nestedError?.message === 'string' ? nestedError.message : String(cause);
    // One log string keeps the underlying connection/query error visible in Netlify.
    console.error(`LigaPro data query failed: ${errorCode} - ${errorDetail.slice(0, 300)}`);
    const errorMessage = errorCode === '28P01'
      ? 'Neon rechazó las credenciales de DATABASE_URL. Actualiza la clave con la conexión vigente de la rama production.'
      : errorCode === '3D000'
        ? 'La base indicada en DATABASE_URL no existe. Copia la URL de conexión de la base correcta en Neon.'
        : errorCode === '42P01'
          ? 'La base conectada no tiene una tabla o vista que la app necesita. DATABASE_URL podría apuntar a otra base o rama de Neon.'
          : errorCode === '42703'
            ? 'La estructura de la base conectada no coincide con la que espera la app: falta una columna.'
            : errorCode.startsWith('08') || errorCode.startsWith('ECONN') || errorCode.startsWith('EAI_')
              ? 'Netlify no pudo establecer conexión con Neon. Revisa el endpoint y la región de DATABASE_URL.'
              : 'Neon rechazó una consulta de datos. Revisa el código de error y el esquema de la base conectada.';
    return Response.json(
      { error: errorMessage, errorCode },
      { status: 503 },
    );
  }
}
