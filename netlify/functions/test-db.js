import { neon } from '@netlify/neon';

export default async (req) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const result = await sql\SELECT NOW() as time, current_database() as db\;
    
    return new Response(JSON.stringify({
      success: true,
      message: '✅ Database connected!',
      data: result[0]
    }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { headers, status: 500 });
  }
};

export const config = {
  path: "/api/test-db"
};
