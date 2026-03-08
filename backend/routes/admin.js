// backend/routes/admin.js
import express from 'express';
import pool from '../config/database.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Admin middleware
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Admin dashboard stats
router.get('/dashboard-stats', verifyAdmin, async (req, res) => {
  try {
    // Get total counts
    const usersResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN role = 'homeowner' THEN 1 END) as homeowners,
        COUNT(CASE WHEN role = 'sitter' THEN 1 END) as sitters,
        COUNT(CASE WHEN verified = true THEN 1 END) as verified_users,
        COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as pending_verifications
      FROM users
    `);
    
    const propertiesResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending_approval' THEN 1 END) as pending_approval,
        COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as pending_verification,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available
      FROM properties
    `);
    
    const arrangementsResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM arrangements
    `);
    
    const recentRequestsResult = await pool.query(`
      SELECT COUNT(*) as count FROM verification_requests 
      WHERE status = 'pending' AND created_at >= NOW() - INTERVAL '7 days'
    `);
    
    const recentActivitiesResult = await pool.query(`
      SELECT action_type, COUNT(*) as count 
      FROM admin_audit_logs 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY action_type
    `);
    
    res.json({
      success: true,
      stats: {
        users: usersResult.rows[0],
        properties: propertiesResult.rows[0],
        arrangements: arrangementsResult.rows[0],
        pending_requests: parseInt(recentRequestsResult.rows[0]?.count || 0),
        recent_activities: recentActivitiesResult.rows
      }
    });
    
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get pending verifications
router.get('/pending-verifications', verifyAdmin, async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT vr.*, u.name as user_name, u.email, u.role as user_role,
        CASE 
          WHEN vr.entity_type = 'user' THEN (SELECT name FROM users WHERE id = vr.entity_id)
          WHEN vr.entity_type = 'property' THEN (SELECT title FROM properties WHERE id = vr.entity_id)
          WHEN vr.entity_type = 'sitter' THEN (SELECT u2.name FROM sitters s JOIN users u2 ON s.user_id = u2.id WHERE s.id = vr.entity_id)
        END as entity_name
      FROM verification_requests vr
      JOIN users u ON vr.user_id = u.id
      WHERE vr.status = 'pending'
    `;
    
    let values = [];
    let paramCount = 1;
    
    if (type) {
      query += ` AND vr.entity_type = $${paramCount}`;
      values.push(type);
      paramCount++;
    }
    
    query += ` ORDER BY vr.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(parseInt(limit), offset);
    
    const requestsResult = await pool.query(query, values);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM verification_requests WHERE status = $1';
    let countValues = ['pending'];
    
    if (type) {
      countQuery += ' AND entity_type = $2';
      countValues.push(type);
    }
    
    const countResult = await pool.query(countQuery, countValues);
    
    res.json({
      success: true,
      requests: requestsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
      }
    });
    
  } catch (error) {
    console.error('Pending verifications error:', error);
    res.status(500).json({ error: 'Failed to fetch pending verifications' });
  }
});

// Get pending properties for approval
router.get('/pending-properties', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const propertiesResult = await pool.query(`
      SELECT p.*, u.name as homeowner_name, u.email, u.verified as homeowner_verified,
        (SELECT COUNT(*) FROM property_images WHERE property_id = p.id) as image_count,
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = true LIMIT 1) as primary_image
      FROM properties p
      JOIN users u ON p.homeowner_id = u.id
      WHERE p.status = 'pending_approval' OR p.verification_status = 'pending'
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `, [parseInt(limit), offset]);
    
    const countResult = await pool.query(`
      SELECT COUNT(*) as total FROM properties 
      WHERE status = 'pending_approval' OR verification_status = 'pending'
    `);
    
    // Get amenities for each property
    for (let property of propertiesResult.rows) {
      const amenitiesResult = await pool.query(
        'SELECT amenity FROM property_amenities WHERE property_id = $1',
        [property.id]
      );
      property.amenities = amenitiesResult.rows.map(a => a.amenity);
      
      const documentsResult = await pool.query(
        'SELECT * FROM property_documents WHERE property_id = $1',
        [property.id]
      );
      property.documents = documentsResult.rows;
    }
    
    res.json({
      success: true,
      properties: propertiesResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
      }
    });
    
  } catch (error) {
    console.error('Pending properties error:', error);
    res.status(500).json({ error: 'Failed to fetch pending properties' });
  }
});

// Get pending sitter verifications
router.get('/pending-sitters', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const sittersResult = await pool.query(`
      SELECT s.*, u.name, u.email, u.verification_status, u.verification_data,
        u.verification_documents, u.verified, u.created_at as user_created
      FROM sitters s
      JOIN users u ON s.user_id = u.id
      WHERE u.verification_status = 'pending' AND u.role = 'sitter'
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `, [parseInt(limit), offset]);
    
    const countResult = await pool.query(`
      SELECT COUNT(*) as total FROM users 
      WHERE verification_status = 'pending' AND role = 'sitter'
    `);
    
    res.json({
      success: true,
      sitters: sittersResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
      }
    });
    
  } catch (error) {
    console.error('Pending sitters error:', error);
    res.status(500).json({ error: 'Failed to fetch pending sitters' });
  }
});

// Get system statistics
router.get('/system-stats', verifyAdmin, async (req, res) => {
  try {
    // Daily registrations (last 30 days)
    const dailyRegistrationsResult = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    
    // User role distribution
    const roleDistributionResult = await pool.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);
    
    // Property type distribution
    const propertyTypesResult = await pool.query(`
      SELECT type, COUNT(*) as count 
      FROM properties 
      GROUP BY type
    `);
    
    // Monthly revenue
    const monthlyRevenueResult = await pool.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month, 
              SUM(total_amount) as revenue, COUNT(*) as bookings
      FROM arrangements
      WHERE status IN ('completed', 'active') AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month ASC
    `);
    
    // Verification stats
    const verificationStatsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE verification_status = 'pending') as pending_users,
        (SELECT COUNT(*) FROM users WHERE verification_status = 'approved') as approved_users,
        (SELECT COUNT(*) FROM properties WHERE verification_status = 'pending') as pending_properties,
        (SELECT COUNT(*) FROM properties WHERE verification_status = 'approved') as approved_properties
    `);
    
    res.json({
      success: true,
      stats: {
        dailyRegistrations: dailyRegistrationsResult.rows,
        roleDistribution: roleDistributionResult.rows,
        propertyTypes: propertyTypesResult.rows,
        monthlyRevenue: monthlyRevenueResult.rows,
        verificationStats: verificationStatsResult.rows[0]
      }
    });
    
  } catch (error) {
    console.error('System stats error:', error);
    res.status(500).json({ error: 'Failed to fetch system statistics' });
  }
});

export default router;