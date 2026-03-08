// backend/db.js
import { neon } from '@netlify/neon';

// This automatically uses NETLIFY_DATABASE_URL from environment
export const sql = neon();

// For transactions or complex queries
export async function query(text, params) {
  const result = await sql(text, params);
  return result;
}