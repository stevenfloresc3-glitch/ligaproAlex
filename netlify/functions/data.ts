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
  } catch {
    return Response.json(
      { error: 'No fue posible consultar los datos públicos de LigaPro' },
      { status: 503 },
    );
  }
}
