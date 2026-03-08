// backend/routes/properties.js - COMPLETELY REMOVED APPROVAL
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
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
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  // Return full URL (adjust port as needed)
  return `http://localhost:5000/${cleanPath}`;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/properties/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'property-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ========== GET ALL PROPERTIES (with filtering) ==========
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      city,
      country,
      minPrice,
      maxPrice,
      bedrooms,
      type,
      search,
      minStayDays
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Only show properties that are available
    let whereConditions = ["p.status = 'available'"];
    let values = [];
    let paramCount = 1;

    if (city && city.trim() !== '') {
      whereConditions.push(`p.city ILIKE $${paramCount}`);
      values.push(`%${city}%`);
      paramCount++;
    }
    
    if (country && country.trim() !== '') {
      whereConditions.push(`p.country ILIKE $${paramCount}`);
      values.push(`%${country}%`);
      paramCount++;
    }
    
    if (minPrice && !isNaN(parseFloat(minPrice))) {
      whereConditions.push(`p.price_per_month >= $${paramCount}`);
      values.push(parseFloat(minPrice));
      paramCount++;
    }
    
    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      whereConditions.push(`p.price_per_month <= $${paramCount}`);
      values.push(parseFloat(maxPrice));
      paramCount++;
    }
    
    if (bedrooms && !isNaN(parseInt(bedrooms))) {
      whereConditions.push(`p.bedrooms >= $${paramCount}`);
      values.push(parseInt(bedrooms));
      paramCount++;
    }
    
    if (type && type.trim() !== '') {
      whereConditions.push(`p.type = $${paramCount}`);
      values.push(type);
      paramCount++;
    }
    
    if (minStayDays && !isNaN(parseInt(minStayDays))) {
      whereConditions.push(`p.min_stay_days <= $${paramCount}`);
      values.push(parseInt(minStayDays));
      paramCount++;
    }
    
    if (search && search.trim() !== '') {
      whereConditions.push(`(
        p.title ILIKE $${paramCount} OR 
        p.description ILIKE $${paramCount} OR 
        p.location ILIKE $${paramCount} OR 
        p.city ILIKE $${paramCount} OR 
        p.country ILIKE $${paramCount}
      )`);
      values.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';

    // Get properties with images
    const propertiesQuery = `
      SELECT 
        p.*,
        u.name as homeowner_name,
        u.avatar_url as homeowner_avatar,
        u.country as homeowner_country,
        u.verified as homeowner_verified,
        u.phone as homeowner_phone,
        u.whatsapp as homeowner_whatsapp,
        (
          SELECT json_agg(amenity)
          FROM property_amenities 
          WHERE property_id = p.id
        ) as amenities,
        (
          SELECT json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'caption', pi.caption,
              'is_primary', pi.is_primary,
              'is_imported', pi.is_imported,
              'display_order', pi.display_order
            )
            ORDER BY pi.display_order, pi.is_primary DESC
          )
          FROM property_images pi 
          WHERE pi.property_id = p.id
        ) as images
      FROM properties p
      LEFT JOIN users u ON p.homeowner_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const queryParams = [...values, parseInt(limit), offset];
    const propertiesResult = await pool.query(propertiesQuery, queryParams);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM properties p
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, values);

    // Process the results
    const processedProperties = propertiesResult.rows.map(property => {
      // Process images to full URLs
      let images = property.images || [];
      if (images.length > 0) {
        images = images.map(img => ({
          ...img,
          image_url: getFullImageUrl(img.image_url)
        }));
      }
      
      // Get primary image
      const primaryImage = images.find(img => img.is_primary)?.image_url || 
                           images[0]?.image_url || null;
      
      return {
        id: property.id,
        title: property.title,
        description: property.description,
        type: property.type,
        bedrooms: parseInt(property.bedrooms) || 1,
        bathrooms: parseInt(property.bathrooms) || 1,
        location: property.location,
        address: property.address,
        city: property.city,
        country: property.country,
        price_per_month: parseFloat(property.price_per_month) || 0,
        security_deposit: parseFloat(property.security_deposit || 0),
        status: property.status || 'available',
        amenities: property.amenities || [],
        images: images,
        primary_image: primaryImage,
        homeowner_name: property.homeowner_name || 'Homeowner',
        homeowner_avatar: property.homeowner_avatar,
        homeowner_country: property.homeowner_country,
        homeowner_verified: property.homeowner_verified || false,
        homeowner_phone: property.homeowner_phone,
        homeowner_whatsapp: property.homeowner_whatsapp,
        square_feet: property.square_feet ? parseInt(property.square_feet) : null,
        min_stay_days: parseInt(property.min_stay_days) || 30,
        max_stay_days: parseInt(property.max_stay_days) || 365,
        latitude: property.latitude ? parseFloat(property.latitude) : null,
        longitude: property.longitude ? parseFloat(property.longitude) : null,
        availability_start: property.availability_start,
        availability_end: property.availability_end,
        created_at: property.created_at,
        updated_at: property.updated_at
      };
    });

    res.json({
      data: processedProperties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(parseInt(countResult.rows[0].total) / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch properties',
      details: error.message 
    });
  }
});

// ========== CREATE PROPERTY ==========
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      bedrooms,
      bathrooms,
      location,
      address,
      city,
      country,
      price_per_month,
      security_deposit,
      amenities,
      square_feet,
      min_stay_days,
      max_stay_days,
      latitude,
      longitude,
      availability_start,
      availability_end,
      website_url,
      airbnb_url,
      virtual_tour_url,
      house_rules,
      imported_images
    } = req.body;

    // Validate required fields
    if (!title || !description || !location || !city || !country || !price_per_month) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, description, location, city, country, and price_per_month are required' 
      });
    }

    // Check if user is a homeowner
    if (req.user.role !== 'homeowner' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only homeowners can list properties' });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const propertyId = uuidv4();
      
      // Insert property with status 'available'
      await client.query(
        `INSERT INTO properties (
          id, homeowner_id, title, description, type, bedrooms, bathrooms, 
          location, address, city, country, price_per_month, security_deposit,
          square_feet, min_stay_days, max_stay_days, latitude, longitude,
          availability_start, availability_end, website_url, airbnb_url,
          virtual_tour_url, house_rules, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, NOW(), NOW())`,
        [
          propertyId,
          req.user.userId,
          title,
          description,
          type || 'house',
          parseInt(bedrooms) || 1,
          parseInt(bathrooms) || 1,
          location,
          address || null,
          city,
          country,
          parseFloat(price_per_month),
          parseFloat(security_deposit) || 0,
          square_feet ? parseInt(square_feet) : null,
          parseInt(min_stay_days) || 30,
          parseInt(max_stay_days) || 365,
          latitude ? parseFloat(latitude) : null,
          longitude ? parseFloat(longitude) : null,
          availability_start || null,
          availability_end || null,
          website_url || null,
          airbnb_url || null,
          virtual_tour_url || null,
          house_rules || null,
          'available'
        ]
      );

      // Add amenities
      if (amenities && Array.isArray(amenities) && amenities.length > 0) {
        for (const amenity of amenities) {
          if (amenity && amenity.trim()) {
            await client.query(
              'INSERT INTO property_amenities (property_id, amenity) VALUES ($1, $2)',
              [propertyId, amenity.trim()]
            );
          }
        }
      }

      // Add imported images if they exist
      if (imported_images && Array.isArray(imported_images) && imported_images.length > 0) {
        console.log(`Saving ${imported_images.length} imported images for property ${propertyId}`);
        
        for (let i = 0; i < imported_images.length; i++) {
          const img = imported_images[i];
          const imageId = uuidv4();
          
          // Extract image data
          let imageUrl = '';
          let caption = `Property image ${i + 1}`;
          let isPrimary = i === 0;
          
          if (typeof img === 'string') {
            imageUrl = img;
          } else {
            imageUrl = img.url || img.imageUrl || img.pictureUrl || '';
            caption = img.caption || caption;
            isPrimary = img.isPrimary || i === 0;
          }
          
          // Ensure URL is absolute
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `https:${imageUrl}`;
          }
          
          if (imageUrl) {
            try {
              // Insert with all available columns
              await client.query(
                `INSERT INTO property_images (
                  id, property_id, image_url, caption, is_primary, 
                  is_imported, original_url, display_order, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
                [
                  imageId,
                  propertyId,
                  imageUrl,
                  caption,
                  isPrimary,
                  true, // is_imported
                  imageUrl, // original_url
                  i // display_order
                ]
              );
              console.log(`  ✅ Saved imported image ${i + 1}: ${imageUrl.substring(0, 50)}...`);
            } catch (err) {
              console.error(`  ❌ Failed to save image ${i + 1}:`, err.message);
              // Continue with other images even if one fails
            }
          }
        }
      }

      await client.query('COMMIT');

      // Get count of total images
      const imageCount = imported_images ? imported_images.length : 0;

      res.status(201).json({
        success: true,
        message: 'Property listed successfully and is now available for sitters!',
        propertyId: propertyId,
        status: 'available',
        images: imageCount
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ 
      error: 'Failed to create property listing',
      details: error.message 
    });
  }
});

// ========== GET SINGLE PROPERTY DETAILS ==========
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const propertyResult = await pool.query(`
      SELECT 
        p.*,
        u.name as homeowner_name,
        u.email as homeowner_email,
        u.country as homeowner_country,
        u.bio as homeowner_bio,
        u.avatar_url as homeowner_avatar,
        u.phone as homeowner_phone,
        u.whatsapp as homeowner_whatsapp,
        u.verified as homeowner_verified,
        (
          SELECT json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'caption', pi.caption,
              'is_primary', pi.is_primary,
              'is_imported', pi.is_imported,
              'display_order', pi.display_order
            )
            ORDER BY pi.display_order, pi.is_primary DESC
          )
          FROM property_images pi 
          WHERE pi.property_id = p.id
        ) as images,
        (
          SELECT json_agg(amenity)
          FROM property_amenities 
          WHERE property_id = p.id
        ) as amenities
      FROM properties p
      LEFT JOIN users u ON p.homeowner_id = u.id
      WHERE p.id = $1
    `, [id]);

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = propertyResult.rows[0];
    
    // Parse JSON fields
    let images = property.images || [];
    let amenities = property.amenities || [];

    // Process images to add full URLs
    if (images.length > 0) {
      images = images.map(img => ({
        ...img,
        image_url: getFullImageUrl(img.image_url)
      }));
    }

    // Get primary image
    const primaryImage = images.find(img => img.is_primary)?.image_url || 
                         images[0]?.image_url || null;

    // Get similar properties
    const similarResult = await pool.query(`
      SELECT 
        p.id,
        p.title,
        p.location,
        p.city,
        p.country,
        p.price_per_month,
        p.min_stay_days,
        (
          SELECT image_url 
          FROM property_images 
          WHERE property_id = p.id AND is_primary = true 
          LIMIT 1
        ) as primary_image
      FROM properties p
      WHERE p.id != $1 
        AND p.status = 'available'
        AND (p.city = $2 OR p.country = $3 OR p.type = $4)
      LIMIT 4
    `, [id, property.city, property.country, property.type]);

    // Process similar properties images
    const similarProperties = similarResult.rows.map(similar => ({
      ...similar,
      primary_image: getFullImageUrl(similar.primary_image)
    }));

    // Get homeowner reviews
    const reviewsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as avg_rating
      FROM reviews
      WHERE reviewee_id = $1
    `, [property.homeowner_id]);

    const processedProperty = {
      id: property.id,
      title: property.title,
      description: property.description,
      type: property.type,
      bedrooms: parseInt(property.bedrooms) || 1,
      bathrooms: parseInt(property.bathrooms) || 1,
      location: property.location,
      address: property.address,
      city: property.city,
      country: property.country,
      price_per_month: parseFloat(property.price_per_month) || 0,
      security_deposit: parseFloat(property.security_deposit || 0),
      status: property.status || 'available',
      amenities: amenities,
      images: images,
      primary_image: primaryImage,
      square_feet: property.square_feet ? parseInt(property.square_feet) : null,
      min_stay_days: parseInt(property.min_stay_days) || 30,
      max_stay_days: parseInt(property.max_stay_days) || 365,
      latitude: property.latitude ? parseFloat(property.latitude) : null,
      longitude: property.longitude ? parseFloat(property.longitude) : null,
      availability_start: property.availability_start,
      availability_end: property.availability_end,
      house_rules: property.house_rules,
      website_url: property.website_url,
      airbnb_url: property.airbnb_url,
      virtual_tour_url: property.virtual_tour_url,
      created_at: property.created_at,
      updated_at: property.updated_at,
      similarProperties: similarProperties,
      // Homeowner info
      homeowner_id: property.homeowner_id,
      homeowner_name: property.homeowner_name || 'Homeowner',
      homeowner_email: property.homeowner_email,
      homeowner_country: property.homeowner_country,
      homeowner_bio: property.homeowner_bio,
      homeowner_avatar: getFullImageUrl(property.homeowner_avatar),
      homeowner_phone: property.homeowner_phone,
      homeowner_whatsapp: property.homeowner_whatsapp,
      homeowner_verified: property.homeowner_verified || false,
      homeowner_reviews: {
        total_reviews: parseInt(reviewsResult.rows[0].total_reviews) || 0,
        avg_rating: parseFloat(reviewsResult.rows[0].avg_rating) || 5.0
      }
    };

    res.json(processedProperty);

  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Failed to fetch property details' });
  }
});

// ========== UPLOAD PROPERTY IMAGES ==========
router.post('/:id/images', verifyToken, upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    // Check if property exists and belongs to user
    const propertyCheck = await pool.query(
      'SELECT homeowner_id FROM properties WHERE id = $1',
      [id]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (propertyCheck.rows[0].homeowner_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to upload images for this property' });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if this is the first image (should be primary)
      const existingImages = await client.query(
        'SELECT COUNT(*) as count FROM property_images WHERE property_id = $1',
        [id]
      );
      const isFirstImage = parseInt(existingImages.rows[0].count) === 0;

      const imageResults = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = `/uploads/properties/${file.filename}`;
        const isPrimary = isFirstImage && i === 0;
        const displayOrder = parseInt(existingImages.rows[0].count) + i;

        const result = await client.query(
          `INSERT INTO property_images (
            id, property_id, image_url, caption, is_primary, 
            is_imported, display_order, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
          RETURNING id, image_url, caption, is_primary, display_order`,
          [
            uuidv4(), 
            id, 
            imageUrl, 
            file.originalname, // caption
            isPrimary, 
            false, // is_imported
            displayOrder
          ]
        );

        imageResults.push(result.rows[0]);
      }

      await client.query('COMMIT');

      // Return full URLs for the uploaded images
      const imagesWithFullUrls = imageResults.map(img => ({
        ...img,
        image_url: getFullImageUrl(img.image_url)
      }));

      res.json({
        success: true,
        message: `${files.length} images uploaded successfully`,
        images: imagesWithFullUrls
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// ========== UPDATE PROPERTY ==========
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if property exists and belongs to user
    const propertyCheck = await pool.query(
      'SELECT homeowner_id FROM properties WHERE id = $1',
      [id]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (propertyCheck.rows[0].homeowner_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to update this property' });
    }

    // Build dynamic update query
    const allowedFields = [
      'title', 'description', 'type', 'bedrooms', 'bathrooms',
      'square_feet', 'location', 'address', 'city', 'country',
      'price_per_month', 'security_deposit', 'min_stay_days', 'max_stay_days',
      'latitude', 'longitude', 'availability_start', 'availability_end',
      'house_rules', 'website_url', 'airbnb_url', 'virtual_tour_url', 'status'
    ];

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        values.push(updates[field]);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);
    const query = `
      UPDATE properties 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      message: 'Property updated successfully',
      property: result.rows[0]
    });

  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// ========== DELETE PROPERTY ==========
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists and belongs to user
    const propertyCheck = await pool.query(
      'SELECT homeowner_id FROM properties WHERE id = $1',
      [id]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (propertyCheck.rows[0].homeowner_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete this property' });
    }

    // Delete property (cascade will delete amenities and images)
    await pool.query('DELETE FROM properties WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });

  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

export default router;