import express from 'express';
import pool from '../config/database.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// GET /api/arrangements - Get user's arrangements
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let query;
    let params;

    if (userRole === 'homeowner') {
      // Get arrangements where user is homeowner
      query = `
        SELECT 
          a.*,
          p.id as property_id,
          p.title as property_title,
          p.location,
          p.city,
          p.country,
          p.price_per_month as monthly_amount,
          p.security_deposit as property_security_deposit,
          u.id as sitter_id,
          u.name as sitter_name,
          u.country as sitter_country,
          u.whatsapp as sitter_whatsapp,
          (
            SELECT COUNT(*)
            FROM messages m
            WHERE m.arrangement_id = a.id
          ) as message_count,
          (
            SELECT COUNT(*)
            FROM transactions t
            WHERE t.arrangement_id = a.id
          ) as transaction_count
        FROM arrangements a
        JOIN properties p ON a.property_id = p.id
        JOIN users u ON a.sitter_id = u.id
        WHERE p.homeowner_id = $1
        ORDER BY a.created_at DESC
      `;
      params = [userId];
    } else if (userRole === 'sitter') {
      // Get arrangements where user is sitter
      query = `
        SELECT 
          a.*,
          p.id as property_id,
          p.title as property_title,
          p.location,
          p.city,
          p.country,
          p.price_per_month as monthly_amount,
          p.security_deposit as property_security_deposit,
          u.id as homeowner_id,
          u.name as homeowner_name,
          u.email as homeowner_email,
          u.whatsapp as homeowner_whatsapp,
          (
            SELECT COUNT(*)
            FROM messages m
            WHERE m.arrangement_id = a.id
          ) as message_count,
          (
            SELECT COUNT(*)
            FROM transactions t
            WHERE t.arrangement_id = a.id
          ) as transaction_count
        FROM arrangements a
        JOIN properties p ON a.property_id = p.id
        JOIN users u ON p.homeowner_id = u.id
        WHERE a.sitter_id = $1
        ORDER BY a.created_at DESC
      `;
      params = [userId];
    } else {
      // Admin - get all arrangements
      query = `
        SELECT 
          a.*,
          p.id as property_id,
          p.title as property_title,
          p.location,
          p.city,
          p.country,
          p.price_per_month as monthly_amount,
          p.security_deposit as property_security_deposit,
          u_sitter.name as sitter_name,
          u_sitter.country as sitter_country,
          u_sitter.whatsapp as sitter_whatsapp,
          u_homeowner.name as homeowner_name,
          u_homeowner.email as homeowner_email,
          u_homeowner.whatsapp as homeowner_whatsapp,
          (
            SELECT COUNT(*)
            FROM messages m
            WHERE m.arrangement_id = a.id
          ) as message_count,
          (
            SELECT COUNT(*)
            FROM transactions t
            WHERE t.arrangement_id = a.id
          ) as transaction_count
        FROM arrangements a
        JOIN properties p ON a.property_id = p.id
        JOIN users u_sitter ON a.sitter_id = u_sitter.id
        JOIN users u_homeowner ON p.homeowner_id = u_homeowner.id
        ORDER BY a.created_at DESC
      `;
      params = [];
    }

    const result = await pool.query(query, params);

    res.json({
      arrangements: result.rows
    });

  } catch (error) {
    console.error('Get arrangements error:', error);
    res.status(500).json({ error: 'Failed to fetch arrangements' });
  }
});

// GET /api/arrangements/:id - Get single arrangement
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const query = `
      SELECT 
        a.*,
        p.id as property_id,
        p.title as property_title,
        p.location,
        p.city,
        p.country,
        p.price_per_month as monthly_amount,
        p.security_deposit as property_security_deposit,
        u_sitter.id as sitter_id,
        u_sitter.name as sitter_name,
        u_sitter.email as sitter_email,
        u_sitter.whatsapp as sitter_whatsapp,
        u_homeowner.id as homeowner_id,
        u_homeowner.name as homeowner_name,
        u_homeowner.email as homeowner_email,
        u_homeowner.whatsapp as homeowner_whatsapp,
        (
          SELECT json_agg(
            json_build_object(
              'id', m.id,
              'sender_id', m.sender_id,
              'sender_name', us.name,
              'message', m.message,
              'created_at', m.created_at,
              'is_read', m.is_read
            ) ORDER BY m.created_at ASC
          )
          FROM messages m
          JOIN users us ON m.sender_id = us.id
          WHERE m.arrangement_id = a.id
        ) as messages
      FROM arrangements a
      JOIN properties p ON a.property_id = p.id
      JOIN users u_sitter ON a.sitter_id = u_sitter.id
      JOIN users u_homeowner ON p.homeowner_id = u_homeowner.id
      WHERE a.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Arrangement not found' });
    }

    const arrangement = result.rows[0];

    // Check if user has access
    if (userRole !== 'admin' && 
        arrangement.sitter_id !== userId && 
        arrangement.homeowner_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(arrangement);

  } catch (error) {
    console.error('Get arrangement error:', error);
    res.status(500).json({ error: 'Failed to fetch arrangement' });
  }
});

// POST /api/arrangements - Create new arrangement
// In arrangements.js, update the POST route - remove security_deposit

// POST /api/arrangements - Create new arrangement
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      propertyId,
      startDate,
      endDate,
      message
    } = req.body;

    if (!propertyId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user is a sitter
    if (req.user.role !== 'sitter') {
      return res.status(403).json({ error: 'Only sitters can create arrangements' });
    }

    // Get the sitter record ID from sitters table using user_id
    const sitterResult = await pool.query(
      'SELECT id FROM sitters WHERE user_id = $1',
      [req.user.userId]
    );

    if (sitterResult.rows.length === 0) {
      return res.status(400).json({ error: 'Sitter profile not found. Please create a sitter profile first.' });
    }

    const sitterRecordId = sitterResult.rows[0].id;

    // Check if property exists and get homeowner_id
    const propertyCheck = await pool.query(
      'SELECT * FROM properties WHERE id = $1',
      [propertyId]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = propertyCheck.rows[0];
    
    // Get homeowner_id from the property
    const homeownerId = property.homeowner_id;

    if (!homeownerId) {
      return res.status(400).json({ error: 'Property has no associated homeowner' });
    }

    // Calculate total amount
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = diffDays / 30;
    const totalAmount = Math.ceil(diffMonths * property.price_per_month);

    // Insert with sitter_record_id (from sitters table) and homeowner_id (from users table)
    const result = await pool.query(
      `INSERT INTO arrangements (
        property_id, sitter_id, homeowner_id, start_date, end_date, 
        status, total_amount, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id`,
      [
        propertyId,
        sitterRecordId, // Use the sitters table ID, not the user ID
        homeownerId,
        startDate,
        endDate,
        'active',
        totalAmount
      ]
    );

    const arrangementId = result.rows[0].id;

    // Create initial message if provided
    if (message && message.trim()) {
      await pool.query(
        `INSERT INTO messages (
          sender_id, receiver_id, arrangement_id, message, created_at
        ) VALUES ($1, $2, $3, $4, NOW())`,
        [req.user.userId, homeownerId, arrangementId, message]
      );
    }

    res.status(201).json({
      arrangementId,
      message: 'Arrangement created successfully',
      status: 'active'
    });

  } catch (error) {
    console.error('Create arrangement error:', error);
    res.status(500).json({ error: 'Failed to create arrangement' });
  }
});

// PUT /api/arrangements/:id/status - Update arrangement status
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await pool.query(
      'UPDATE arrangements SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );

    res.json({
      message: `Arrangement ${status} successfully`
    });

  } catch (error) {
    console.error('Update arrangement status error:', error);
    res.status(500).json({ error: 'Failed to update arrangement status' });
  }
});

// POST /api/arrangements/:id/notice-to-vacate - Send 5-day notice
router.post('/:id/notice-to-vacate', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      message: '5-day Notice to Vacate sent successfully',
      noticeDate: new Date().toISOString(),
      vacateBy: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

  } catch (error) {
    console.error('Send notice to vacate error:', error);
    res.status(500).json({ error: 'Failed to send notice to vacate' });
  }
});

export default router;