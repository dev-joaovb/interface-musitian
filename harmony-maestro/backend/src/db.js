// src/db.js
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️  DATABASE_URL não configurado. Utilizando fallback em memória (DB desativado).');
  // stub simples que tem .query (retorna rows[])
  module.exports = {
    query: async (/* text, params */) => ({ rows: [] }),
    end: async () => {},
  };
}

const pool = new Pool({
  connectionString,
  // ssl: { rejectUnauthorized: false }, // ajustar para production
});

module.exports = pool;
