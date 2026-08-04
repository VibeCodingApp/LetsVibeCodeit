const { createPool } = require('@vercel/postgres');

async function main() {
  const pool = createPool({ connectionString: process.argv[2] });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sponsor_placements (
      id SERIAL PRIMARY KEY,
      session_id TEXT UNIQUE NOT NULL,
      plan TEXT NOT NULL,
      slot_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      website TEXT NOT NULL,
      creative_mode TEXT NOT NULL,
      banner_base64 TEXT DEFAULT '',
      icon_base64 TEXT DEFAULT '',
      marquee_icon_base64 TEXT DEFAULT '',
      marquee_text TEXT DEFAULT '',
      activated_at BIGINT NOT NULL,
      expires_at BIGINT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('table ready');
  await pool.end();
}

main().catch(e => { console.error('schema error:', e.message); process.exit(1); });
