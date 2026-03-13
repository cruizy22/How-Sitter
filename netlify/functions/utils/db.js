import { neon } from '@netlify/neon';

const sql = neon(process.env.NETLIFY_DATABASE_URL);

export async function query(text, params) {
  try {
    const result = await sql(text, params);
    return { data: result, error: null };
  } catch (error) {
    console.error('Database query error:', error);
    return { data: null, error };
  }
}

export async function getOne(text, params) {
  const result = await query(text, params);
  return { data: result.data?.[0] || null, error: result.error };
}

export default sql;
