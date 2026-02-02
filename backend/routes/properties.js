import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'howsitter',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/properties/';
    // Create directory if it doesn't exist
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
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10 // Max 10 files per upload
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// ========== PROPERTY ROUTES ==========

// 1. CREATE PROPERTY (with images upload)
router.post('/', verifyToken, upload.array('images', 10), async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      bedrooms,
      bathrooms,
      location,
      city,
      country,
      price_per_month,
      security_deposit,
      amenities,
      square_feet,
      min_stay_days,
      max_stay_days,
      rules,
      website_url,
      virtual_tour_url,
      latitude,
      longitude
    } = req.body;

    // Validate required fields
    if (!title || !description || !location || !city || !country || !price_per_month) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, description, location, city, country, and price_per_month are required' 
      });
    }

    // Check if user is a homeowner
    if (req.user.role !== 'homeowner') {
      return res.status(403).json({ error: 'Only homeowners can list properties' });
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Create property record
      const propertyId = uuidv4();
      await connection.execute(
        `INSERT INTO properties (
          id, homeowner_id, title, description, type, bedrooms, bathrooms, 
          location, city, country, price_per_month, security_deposit,
          square_feet, min_stay_days, max_stay_days, rules, website_url,
          virtual_tour_url, latitude, longitude, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          propertyId,
          req.user.userId,
          title,
          description,
          type || 'house',
          parseInt(bedrooms) || 1,
          parseInt(bathrooms) || 1,
          location,
          city,
          country,
          parseFloat(price_per_month),
          parseFloat(security_deposit) || 0,
          square_feet ? parseInt(square_feet) : null,
          parseInt(min_stay_days) || 30,
          parseInt(max_stay_days) || 365,
          rules || '',
          website_url || null,
          virtual_tour_url || null,
          latitude || null,
          longitude || null
        ]
      );

      // Add amenities
      let amenitiesArray = [];
      if (amenities) {
        if (typeof amenities === 'string') {
          try {
            amenitiesArray = JSON.parse(amenities);
          } catch {
            amenitiesArray = amenities.split(',').map(a => a.trim());
          }
        } else if (Array.isArray(amenities)) {
          amenitiesArray = amenities;
        }

        for (const amenity of amenitiesArray) {
          if (amenity.trim()) {
            await connection.execute(
              'INSERT INTO property_amenities (property_id, amenity) VALUES (?, ?)',
              [propertyId, amenity.trim()]
            );
          }
        }
      }

      // Handle image uploads
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const imageId = uuidv4();
          const imagePath = `/uploads/properties/${file.filename}`;
          
          await connection.execute(
            `INSERT INTO property_images (
              id, property_id, image_url, display_order, is_primary, uploaded_at
            ) VALUES (?, ?, ?, ?, ?, NOW())`,
            [
              imageId,
              propertyId,
              imagePath,
              i,
              i === 0 ? 1 : 0 // First image is primary
            ]
          );
        }
      }

      await connection.commit();

      res.status(201).json({
        message: 'Property listed successfully and is pending verification',
        propertyId: propertyId,
        status: 'pending',
        images: req.files ? req.files.length : 0
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ 
      error: 'Failed to create property listing',
      details: error.message 
    });
  }
});

// 2. GET ALL PROPERTIES (with filtering)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      city,
      country,
      min_price,
      max_price,
      min_bedrooms,
      max_bedrooms,
      property_type,
      amenities,
      min_stay,
      max_stay,
      search,
      status = 'available' // Default to available properties
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClauses = ['p.status = ?'];
    let params = [status];
    let paramCount = 1;

    // Build dynamic WHERE clause based on filters
    if (city) {
      whereClauses.push(`p.city LIKE ?`);
      params.push(`%${city}%`);
    }
    
    if (country) {
      whereClauses.push(`p.country LIKE ?`);
      params.push(`%${country}%`);
    }
    
    if (min_price) {
      whereClauses.push(`p.price_per_month >= ?`);
      params.push(parseFloat(min_price));
    }
    
    if (max_price) {
      whereClauses.push(`p.price_per_month <= ?`);
      params.push(parseFloat(max_price));
    }
    
    if (min_bedrooms) {
      whereClauses.push(`p.bedrooms >= ?`);
      params.push(parseInt(min_bedrooms));
    }
    
    if (max_bedrooms) {
      whereClauses.push(`p.bedrooms <= ?`);
      params.push(parseInt(max_bedrooms));
    }
    
    if (property_type) {
      whereClauses.push(`p.type = ?`);
      params.push(property_type);
    }
    
    if (min_stay) {
      whereClauses.push(`p.min_stay_days >= ?`);
      params.push(parseInt(min_stay));
    }
    
    if (max_stay) {
      whereClauses.push(`p.max_stay_days <= ?`);
      params.push(parseInt(max_stay));
    }
    
    if (search) {
      whereClauses.push(`(
        p.title LIKE ? OR 
        p.description LIKE ? OR 
        p.location LIKE ? OR 
        p.city LIKE ? OR 
        p.country LIKE ?
      )`);
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    // Base query
    const baseQuery = `
      SELECT 
        p.*,
        u.name as homeowner_name,
        u.email as homeowner_email,
        u.country as homeowner_country,
        u.bio as homeowner_bio,
        u.avatar_url as homeowner_avatar,
        GROUP_CONCAT(DISTINCT pa.amenity) as amenities_list,
        (
          SELECT pi.image_url 
          FROM property_images pi 
          WHERE pi.property_id = p.id AND pi.is_primary = 1 
          LIMIT 1
        ) as primary_image,
        (
          SELECT COUNT(DISTINCT pi.id) 
          FROM property_images pi 
          WHERE pi.property_id = p.id
        ) as image_count,
        (
          SELECT COUNT(DISTINCT r.id) 
          FROM reviews r 
          WHERE r.property_id = p.id
        ) as review_count,
        (
          SELECT AVG(r.rating) 
          FROM reviews r 
          WHERE r.property_id = p.id
        ) as average_rating
      FROM properties p
      LEFT JOIN users u ON p.homeowner_id = u.id
      LEFT JOIN property_amenities pa ON p.id = pa.property_id
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    // Count query
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM properties p
      LEFT JOIN property_amenities pa ON p.id = pa.property_id
      WHERE ${whereClauses.join(' AND ')}
    `;

    // Add limit and offset to params
    const queryParams = [...params, parseInt(limit), offset];
    const countParams = params;

    // Execute queries
    const [properties] = await pool.execute(baseQuery, queryParams);
    const [countResult] = await pool.execute(countQuery, countParams);
    
    const total = countResult[0]?.total || 0;

    // Process amenities list
    const processedProperties = properties.map(property => {
      const amenities = property.amenities_list ? property.amenities_list.split(',') : [];
      delete property.amenities_list;
      
      return {
        ...property,
        amenities,
        price_per_month: parseFloat(property.price_per_month),
        security_deposit: parseFloat(property.security_deposit),
        average_rating: property.average_rating ? parseFloat(property.average_rating) : 0
      };
    });

    // Handle amenities filter after main query (for complex OR conditions)
    let filteredProperties = processedProperties;
    if (amenities) {
      const amenityList = amenities.split(',').map(a => a.trim());
      filteredProperties = processedProperties.filter(property => {
        return amenityList.every(amenity => property.amenities.includes(amenity));
      });
    }

    res.json({
      properties: filteredProperties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredProperties.length, // Use filtered count
        pages: Math.ceil(filteredProperties.length / parseInt(limit))
      },
      filters: {
        city,
        country,
        min_price,
        max_price,
        min_bedrooms,
        max_bedrooms,
        property_type,
        amenities: amenities ? amenities.split(',') : null,
        min_stay,
        max_stay,
        search
      }
    });

  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// 3. GET SINGLE PROPERTY DETAILS
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get property details
    const [properties] = await pool.execute(
      `SELECT 
        p.*,
        u.name as homeowner_name,
        u.email as homeowner_email,
        u.country as homeowner_country,
        u.bio as homeowner_bio,
        u.avatar_url as homeowner_avatar,
        u.phone as homeowner_phone,
        (
          SELECT COUNT(DISTINCT r.id) 
          FROM reviews r 
          WHERE r.reviewee_id = u.id AND r.role = 'homeowner'
        ) as homeowner_total_reviews,
        (
          SELECT AVG(r.rating) 
          FROM reviews r 
          WHERE r.reviewee_id = u.id AND r.role = 'homeowner'
        ) as homeowner_avg_rating,
        (
          SELECT COUNT(DISTINCT a.id) 
          FROM arrangements a 
          WHERE a.property_id = p.id AND a.status = 'completed'
        ) as completed_arrangements
      FROM properties p
      JOIN users u ON p.homeowner_id = u.id
      WHERE p.id = ?`,
      [id]
    );

    if (properties.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = properties[0];

    // Get amenities
    const [amenities] = await pool.execute(
      'SELECT amenity FROM property_amenities WHERE property_id = ?',
      [id]
    );
    property.amenities = amenities.map(a => a.amenity);

    // Get images
    const [images] = await pool.execute(
      'SELECT * FROM property_images WHERE property_id = ? ORDER BY display_order, is_primary DESC',
      [id]
    );
    property.images = images;

    // Get reviews for this property
    const [reviews] = await pool.execute(
      `SELECT 
        r.*,
        u.name as reviewer_name,
        u.avatar_url as reviewer_avatar,
        u.country as reviewer_country
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.property_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10`,
      [id]
    );
    property.reviews = reviews;

    // Get similar properties (same city/type, excluding current)
    const [similarProperties] = await pool.execute(
      `SELECT 
        p.*,
        u.name as homeowner_name,
        u.country as homeowner_country,
        (
          SELECT pi.image_url 
          FROM property_images pi 
          WHERE pi.property_id = p.id AND pi.is_primary = 1 
          LIMIT 1
        ) as primary_image,
        GROUP_CONCAT(DISTINCT pa.amenity) as amenities_list
      FROM properties p
      JOIN users u ON p.homeowner_id = u.id
      LEFT JOIN property_amenities pa ON p.id = pa.property_id
      WHERE p.id != ? 
        AND p.city = ? 
        AND p.type = ? 
        AND p.status = 'available'
      GROUP BY p.id
      LIMIT 6`,
      [id, property.city, property.type]
    );

    // Process amenities for similar properties
    property.similarProperties = similarProperties.map(sp => {
      const spAmenities = sp.amenities_list ? sp.amenities_list.split(',') : [];
      delete sp.amenities_list;
      
      return {
        ...sp,
        amenities: spAmenities,
        price_per_month: parseFloat(sp.price_per_month)
      };
    });

    // Calculate total reviews and average rating
    const totalReviews = property.reviews.length;
    const avgRating = totalReviews > 0 
      ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    property.review_stats = {
      total_reviews: totalReviews,
      average_rating: avgRating.toFixed(1)
    };

    res.json(property);

  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Failed to fetch property details' });
  }
});

// 4. UPDATE PROPERTY
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if property exists and user owns it
    const [properties] = await pool.execute(
      'SELECT homeowner_id FROM properties WHERE id = ?',
      [id]
    );

    if (properties.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = properties[0];
    
    // Check ownership
    if (property.homeowner_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only update your own properties' });
    }

    // Build update query dynamically
    const allowedFields = [
      'title', 'description', 'type', 'bedrooms', 'bathrooms',
      'location', 'city', 'country', 'price_per_month', 'security_deposit',
      'square_feet', 'min_stay_days', 'max_stay_days', 'rules',
      'website_url', 'virtual_tour_url', 'latitude', 'longitude', 'status'
    ];

    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(updateData[field]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    const query = `UPDATE properties SET ${updates.join(', ')} WHERE id = ?`;

    await pool.execute(query, values);

    // Update amenities if provided
    if (updateData.amenities !== undefined) {
      // Delete existing amenities
      await pool.execute('DELETE FROM property_amenities WHERE property_id = ?', [id]);
      
      // Add new amenities
      let amenitiesArray = [];
      if (typeof updateData.amenities === 'string') {
        try {
          amenitiesArray = JSON.parse(updateData.amenities);
        } catch {
          amenitiesArray = updateData.amenities.split(',').map(a => a.trim());
        }
      } else if (Array.isArray(updateData.amenities)) {
        amenitiesArray = updateData.amenities;
      }

      for (const amenity of amenitiesArray) {
        if (amenity.trim()) {
          await pool.execute(
            'INSERT INTO property_amenities (property_id, amenity) VALUES (?, ?)',
            [id, amenity.trim()]
          );
        }
      }
    }

    res.json({ 
      message: 'Property updated successfully',
      propertyId: id
    });

  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// 5. DELETE PROPERTY
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists and user owns it
    const [properties] = await pool.execute(
      'SELECT homeowner_id FROM properties WHERE id = ?',
      [id]
    );

    if (properties.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = properties[0];
    
    // Check ownership or admin
    if (property.homeowner_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own properties' });
    }

    // Check for active arrangements
    const [arrangements] = await pool.execute(
      `SELECT status FROM arrangements 
       WHERE property_id = ? 
       AND status IN ('pending', 'confirmed', 'active')`,
      [id]
    );

    if (arrangements.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete property with active or pending arrangements' 
      });
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Delete associated records
      await connection.execute('DELETE FROM property_amenities WHERE property_id = ?', [id]);
      await connection.execute('DELETE FROM saved_properties WHERE property_id = ?', [id]);
      await connection.execute('DELETE FROM property_images WHERE property_id = ?', [id]);
      await connection.execute('DELETE FROM properties WHERE id = ?', [id]);

      await connection.commit();

      res.json({ message: 'Property deleted successfully' });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// 6. GET USER'S PROPERTIES
router.get('/user/my-properties', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = 'homeowner_id = ?';
    let params = [req.user.userId];
    
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    params.push(parseInt(limit), offset);

    const [properties] = await pool.execute(
      `SELECT 
        p.*,
        (
          SELECT COUNT(DISTINCT a.id) 
          FROM arrangements a 
          WHERE a.property_id = p.id
        ) as total_arrangements,
        (
          SELECT COUNT(DISTINCT a.id) 
          FROM arrangements a 
          WHERE a.property_id = p.id AND a.status = 'active'
        ) as active_arrangements,
        (
          SELECT pi.image_url 
          FROM property_images pi 
          WHERE pi.property_id = p.id AND pi.is_primary = 1 
          LIMIT 1
        ) as primary_image
      FROM properties p
      WHERE ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`,
      params
    );

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM properties WHERE ${whereClause}`,
      params.slice(0, params.length - 2) // Remove limit and offset
    );

    const total = countResult[0]?.total || 0;

    res.json({
      properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get user properties error:', error);
    res.status(500).json({ error: 'Failed to fetch user properties' });
  }
});

// 7. PROPERTY IMAGES MANAGEMENT
router.post('/:id/images', verifyToken, upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists and user owns it
    const [properties] = await pool.execute(
      'SELECT homeowner_id FROM properties WHERE id = ?',
      [id]
    );

    if (properties.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = properties[0];
    
    if (property.homeowner_id !== req.user.userId) {
      return res.status(403).json({ error: 'You can only add images to your own properties' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get current max display order
      const [maxOrderResult] = await connection.execute(
        'SELECT MAX(display_order) as max_order FROM property_images WHERE property_id = ?',
        [id]
      );
      let currentOrder = maxOrderResult[0]?.max_order || -1;

      const uploadedImages = [];

      // Insert each image
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageId = uuidv4();
        const imagePath = `/uploads/properties/${file.filename}`;
        currentOrder++;

        await connection.execute(
          `INSERT INTO property_images (
            id, property_id, image_url, display_order, uploaded_at
          ) VALUES (?, ?, ?, ?, NOW())`,
          [imageId, id, imagePath, currentOrder]
        );

        uploadedImages.push({
          id: imageId,
          image_url: imagePath,
          display_order: currentOrder
        });
      }

      await connection.commit();

      res.status(201).json({
        message: 'Images uploaded successfully',
        images: uploadedImages,
        count: uploadedImages.length
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Upload property images error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// 8. DELETE PROPERTY IMAGE
router.delete('/:id/images/:imageId', verifyToken, async (req, res) => {
  try {
    const { id, imageId } = req.params;

    // Check if property exists and user owns it
    const [properties] = await pool.execute(
      'SELECT homeowner_id FROM properties WHERE id = ?',
      [id]
    );

    if (properties.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = properties[0];
    
    if (property.homeowner_id !== req.user.userId) {
      return res.status(403).json({ error: 'You can only delete images from your own properties' });
    }

    // Get image info
    const [images] = await pool.execute(
      'SELECT image_url, is_primary FROM property_images WHERE id = ? AND property_id = ?',
      [imageId, id]
    );

    if (images.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const image = images[0];

    // Check if trying to delete primary image
    if (image.is_primary) {
      return res.status(400).json({ error: 'Cannot delete primary image. Set another image as primary first.' });
    }

    // Delete image file from filesystem
    const filePath = path.join(process.cwd(), image.image_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await pool.execute(
      'DELETE FROM property_images WHERE id = ? AND property_id = ?',
      [imageId, id]
    );

    res.json({ message: 'Image deleted successfully' });

  } catch (error) {
    console.error('Delete property image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// 9. SET PRIMARY IMAGE
router.put('/:id/images/:imageId/primary', verifyToken, async (req, res) => {
  try {
    const { id, imageId } = req.params;

    // Check if property exists and user owns it
    const [properties] = await pool.execute(
      'SELECT homeowner_id FROM properties WHERE id = ?',
      [id]
    );

    if (properties.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = properties[0];
    
    if (property.homeowner_id !== req.user.userId) {
      return res.status(403).json({ error: 'You can only update images of your own properties' });
    }

    // Check if image exists
    const [images] = await pool.execute(
      'SELECT id FROM property_images WHERE id = ? AND property_id = ?',
      [imageId, id]
    );

    if (images.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Reset all images to non-primary
      await connection.execute(
        'UPDATE property_images SET is_primary = 0 WHERE property_id = ?',
        [id]
      );

      // Set selected image as primary
      await connection.execute(
        'UPDATE property_images SET is_primary = 1 WHERE id = ? AND property_id = ?',
        [imageId, id]
      );

      await connection.commit();

      res.json({ message: 'Primary image updated successfully' });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Set primary image error:', error);
    res.status(500).json({ error: 'Failed to set primary image' });
  }
});

// 10. REORDER IMAGES
router.put('/:id/images/reorder', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { imageOrder } = req.body; // Array of image IDs in new order

    if (!Array.isArray(imageOrder)) {
      return res.status(400).json({ error: 'imageOrder must be an array of image IDs' });
    }

    // Check if property exists and user owns it
    const [properties] = await pool.execute(
      'SELECT homeowner_id FROM properties WHERE id = ?',
      [id]
    );

    if (properties.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = properties[0];
    
    if (property.homeowner_id !== req.user.userId) {
      return res.status(403).json({ error: 'You can only reorder images of your own properties' });
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Update display order for each image
      for (let i = 0; i < imageOrder.length; i++) {
        await connection.execute(
          'UPDATE property_images SET display_order = ? WHERE id = ? AND property_id = ?',
          [i, imageOrder[i], id]
        );
      }

      await connection.commit();

      res.json({ message: 'Images reordered successfully' });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Reorder images error:', error);
    res.status(500).json({ error: 'Failed to reorder images' });
  }
});

// 11. CHECK PROPERTY AVAILABILITY
router.post('/:id/check-availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    // Check if property exists and is available
    const [properties] = await pool.execute(
      'SELECT min_stay_days, max_stay_days, status FROM properties WHERE id = ?',
      [id]
    );

    if (properties.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = properties[0];
    
    if (property.status !== 'available') {
      return res.json({
        available: false,
        message: 'Property is not available for new arrangements'
      });
    }

    // Check stay duration
    const start = new Date(start_date);
    const end = new Date(end_date);
    const stayDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (stayDays < property.min_stay_days) {
      return res.json({
        available: false,
        message: `Minimum stay is ${property.min_stay_days} days`
      });
    }

    if (stayDays > property.max_stay_days) {
      return res.json({
        available: false,
        message: `Maximum stay is ${property.max_stay_days} days`
      });
    }

    // Check for date conflicts
    const [conflicts] = await pool.execute(
      `SELECT * FROM arrangements 
       WHERE property_id = ? 
       AND status IN ('pending', 'confirmed', 'active')
       AND (
         (start_date <= ? AND end_date >= ?) OR
         (start_date <= ? AND end_date >= ?) OR
         (start_date >= ? AND end_date <= ?)
       )`,
      [id, end_date, start_date, end_date, start_date, start_date, end_date]
    );

    if (conflicts.length > 0) {
      return res.json({
        available: false,
        message: 'Property is not available for the selected dates'
      });
    }

    res.json({
      available: true,
      message: 'Property is available for the selected dates',
      stay_days: stayDays
    });

  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

// 12. GET PROPERTY STATISTICS
router.get('/:id/stats', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists and user owns it
    const [properties] = await pool.execute(
      'SELECT homeowner_id FROM properties WHERE id = ?',
      [id]
    );

    if (properties.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = properties[0];
    
    if (property.homeowner_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only view stats for your own properties' });
    }

    // Get arrangement statistics
    const [arrangementStats] = await pool.execute(
      `SELECT 
        status,
        COUNT(*) as count,
        AVG(DATEDIFF(end_date, start_date)) as avg_duration
      FROM arrangements 
      WHERE property_id = ?
      GROUP BY status`,
      [id]
    );

    // Get total views (if you have a views tracking system)
    const [viewsStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_views,
        COUNT(DISTINCT user_id) as unique_viewers
      FROM property_views 
      WHERE property_id = ?`,
      [id]
    );

    // Get inquiry statistics
    const [inquiryStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_inquiries,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_inquiries,
        SUM(CASE WHEN status = 'responded' THEN 1 ELSE 0 END) as responded_inquiries
      FROM inquiries 
      WHERE property_id = ?`,
      [id]
    );

    res.json({
      arrangement_stats: arrangementStats,
      view_stats: viewsStats[0] || { total_views: 0, unique_viewers: 0 },
      inquiry_stats: inquiryStats[0] || { total_inquiries: 0, pending_inquiries: 0, responded_inquiries: 0 }
    });

  } catch (error) {
    console.error('Get property stats error:', error);
    res.status(500).json({ error: 'Failed to fetch property statistics' });
  }
});

// 13. SEARCH PROPERTIES BY LOCATION (for maps)
router.get('/search/location', async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query; // radius in kilometers

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Haversine formula to calculate distance
    const query = `
      SELECT 
        p.*,
        u.name as homeowner_name,
        (
          6371 * acos(
            cos(radians(?)) * cos(radians(p.latitude)) * 
            cos(radians(p.longitude) - radians(?)) + 
            sin(radians(?)) * sin(radians(p.latitude))
          )
        ) as distance,
        (
          SELECT pi.image_url 
          FROM property_images pi 
          WHERE pi.property_id = p.id AND pi.is_primary = 1 
          LIMIT 1
        ) as primary_image
      FROM properties p
      JOIN users u ON p.homeowner_id = u.id
      WHERE p.status = 'available'
        AND p.latitude IS NOT NULL 
        AND p.longitude IS NOT NULL
      HAVING distance <= ?
      ORDER BY distance
      LIMIT 50
    `;

    const [properties] = await pool.execute(query, [lat, lng, lat, parseFloat(radius)]);

    res.json({
      properties,
      search_location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      radius_km: parseFloat(radius),
      count: properties.length
    });

  } catch (error) {
    console.error('Location search error:', error);
    res.status(500).json({ error: 'Failed to search properties by location' });
  }
});

export default router;