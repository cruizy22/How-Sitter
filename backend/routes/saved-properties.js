// backend/routes/saved-properties.js
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
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

// Helper function to get full image URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  return `http://localhost:5000/${cleanPath}`;
};

// ========== GET USER'S SAVED PROPERTIES ==========
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(`
      SELECT 
        sp.id as saved_id,
        sp.created_at as saved_at,
        p.*,
        u.name as homeowner_name,
        u.avatar_url as homeowner_avatar,
        u.verified as homeowner_verified,
        u.country as homeowner_country,
        (
          SELECT json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'caption', pi.caption,
              'is_primary', pi.is_primary,
              'display_order', pi.display_order
            )
            ORDER BY pi.is_primary DESC, pi.display_order
          )
          FROM property_images pi 
          WHERE pi.property_id = p.id
        ) as images
      FROM saved_properties sp
      JOIN properties p ON sp.property_id = p.id
      JOIN users u ON p.homeowner_id = u.id
      WHERE sp.user_id = $1
      ORDER BY sp.created_at DESC
    `, [userId]);

    // Process images to add full URLs
    const savedProperties = result.rows.map(property => {
      let images = property.images || [];
      if (images.length > 0) {
        images = images.map(img => ({
          ...img,
          image_url: getFullImageUrl(img.image_url)
        }));
      }

      const primaryImage = images.find(img => img.is_primary)?.image_url || 
                          images[0]?.image_url || null;

      return {
        saved_id: property.saved_id,
        saved_at: property.saved_at,
        id: property.id,
        title: property.title,
        description: property.description,
        type: property.type,
        bedrooms: parseInt(property.bedrooms) || 1,
        bathrooms: parseInt(property.bathrooms) || 1,
        location: property.location,
        city: property.city,
        country: property.country,
        price_per_month: parseFloat(property.price_per_month) || 0,
        security_deposit: parseFloat(property.security_deposit || 0),
        status: property.status || 'available',
        amenities: property.amenities || [],
        images: images,
        primary_image: primaryImage,
        min_stay_days: parseInt(property.min_stay_days) || 30,
        max_stay_days: parseInt(property.max_stay_days) || 365,
        square_feet: property.square_feet ? parseInt(property.square_feet) : null,
        homeowner_name: property.homeowner_name || 'Homeowner',
        homeowner_avatar: property.homeowner_avatar,
        homeowner_verified: property.homeowner_verified || false,
        homeowner_country: property.homeowner_country || property.country || 'Unknown'
      };
    });

    res.json({
      success: true,
      data: savedProperties
    });

  } catch (error) {
    console.error('Get saved properties error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch saved properties',
      details: error.message 
    });
  }
});

// ========== SAVE A PROPERTY ==========
router.post('/:propertyId', verifyToken, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.userId;

    // Check if property exists
    const propertyCheck = await pool.query(
      'SELECT id FROM properties WHERE id = $1',
      [propertyId]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if already saved
    const existingCheck = await pool.query(
      'SELECT id FROM saved_properties WHERE user_id = $1 AND property_id = $2',
      [userId, propertyId]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Property already saved' });
    }

    // Save the property
    const savedId = uuidv4();
    await pool.query(
      `INSERT INTO saved_properties (id, user_id, property_id, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [savedId, userId, propertyId]
    );

    res.json({
      success: true,
      message: 'Property saved successfully',
      savedId: savedId
    });

  } catch (error) {
    console.error('Save property error:', error);
    res.status(500).json({ 
      error: 'Failed to save property',
      details: error.message 
    });
  }
});

// ========== UNSAVE A PROPERTY ==========
router.delete('/:propertyId', verifyToken, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      'DELETE FROM saved_properties WHERE user_id = $1 AND property_id = $2 RETURNING id',
      [userId, propertyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Saved property not found' });
    }

    res.json({
      success: true,
      message: 'Property removed from saved'
    });

  } catch (error) {
    console.error('Unsave property error:', error);
    res.status(500).json({ 
      error: 'Failed to unsave property',
      details: error.message 
    });
  }
});

// ========== CHECK IF PROPERTY IS SAVED ==========
router.get('/check/:propertyId', verifyToken, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT id FROM saved_properties WHERE user_id = $1 AND property_id = $2',
      [userId, propertyId]
    );

    res.json({
      isSaved: result.rows.length > 0,
      savedId: result.rows[0]?.id || null
    });

  } catch (error) {
    console.error('Check saved property error:', error);
    res.status(500).json({ 
      error: 'Failed to check saved status',
      details: error.message 
    });
  }
});

export default router;