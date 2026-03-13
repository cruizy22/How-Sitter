import { neon } from '@netlify/neon';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers, status: 204 });
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const url = new URL(req.url);
    
    // GET /api/properties
    if (req.method === 'GET') {
      const properties = await sql\
        SELECT p.*, u.name as homeowner_name 
        FROM properties p
        LEFT JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 20
      \;
      
      return new Response(JSON.stringify({ data: properties }), { headers });
    }
    
    // POST /api/properties
    if (req.method === 'POST') {
      const body = await req.json();
      
      const [property] = await sql\
        INSERT INTO properties (
          title, description, type, bedrooms, bathrooms,
          location, city, country, price_per_month
        ) VALUES (
          \, \, \,
          \, \, \,
          \, \, \
        )
        RETURNING *
      \;
      
      return new Response(JSON.stringify({ success: true, data: property }), { 
        headers, status: 201 
      });
    }
    
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      headers, status: 405 
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      headers, status: 500 
    });
  }
};

export const config = {
  path: "/api/properties"
};
