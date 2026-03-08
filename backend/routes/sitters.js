// backend/routes/sitters.js - FIXED ROUTE ORDER
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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/sitters/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'sitter-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
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

// ========== FAVORITES ROUTES - MUST COME BEFORE /:id ==========

// GET favorite sitters for current user
router.get('/favorites', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.country,
        u.bio,
        u.avatar_url,
        u.created_at,
        u.location,
        s.id as sitter_id,
        s.experience_years,
        s.skills,
        s.languages,
        s.is_available,
        (
          SELECT COALESCE(AVG(r.rating), 0)
          FROM reviews r
          WHERE r.reviewee_id = u.id
        ) as avg_rating,
        (
          SELECT COUNT(*)
          FROM reviews r
          WHERE r.reviewee_id = u.id
        ) as total_reviews,
        (
          SELECT COUNT(*)
          FROM arrangements a
          WHERE a.sitter_id = u.id AND a.status = 'completed'
        ) as completed_arrangements
      FROM favorite_sitters f
      JOIN users u ON f.sitter_id = u.id
      LEFT JOIN sitters s ON u.id = s.user_id
      WHERE f.user_id = $1 AND u.role = 'sitter'
      ORDER BY f.saved_at DESC
    `, [userId]);

    // Process JSON fields
    const favorites = result.rows.map(sitter => {
      const languages = sitter.languages ? JSON.parse(sitter.languages) : [];
      const skills = sitter.skills ? JSON.parse(sitter.skills) : [];
      
      return {
        id: sitter.id,
        name: sitter.name,
        email: sitter.email,
        phone: sitter.phone,
        country: sitter.country,
        bio: sitter.bio,
        avatar_url: sitter.avatar_url,
        avatar: sitter.avatar_url,
        location: sitter.location,
        languages: languages,
        skills: skills,
        credentials: skills,
        rating: parseFloat(sitter.avg_rating) || 0,
        avg_rating: parseFloat(sitter.avg_rating) || 0,
        total_reviews: parseInt(sitter.total_reviews) || 0,
        completed_arrangements: parseInt(sitter.completed_arrangements) || 0,
        experience_years: parseInt(sitter.experience_years) || 0,
        is_available: sitter.is_available === true,
        total_sits: parseInt(sitter.completed_arrangements) || 0
      };
    });

    res.json({
      data: favorites,
      pagination: {
        page: 1,
        limit: favorites.length,
        total: favorites.length,
        pages: 1
      }
    });

  } catch (error) {
    console.error('Get favorite sitters error:', error);
    res.status(500).json({ error: 'Failed to fetch favorite sitters' });
  }
});

// Add sitter to favorites
router.post('/:sitterId/favorite', verifyToken, async (req, res) => {
  try {
    const { sitterId } = req.params;
    const userId = req.user.userId;

    // Check if sitter exists
    const sitterCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND role = $2',
      [sitterId, 'sitter']
    );

    if (sitterCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Sitter not found' });
    }

    // Add to favorites (ignore if already exists)
    await pool.query(
      `INSERT INTO favorite_sitters (user_id, sitter_id, saved_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, sitter_id) DO NOTHING`,
      [userId, sitterId]
    );

    res.json({ message: 'Sitter added to favorites' });

  } catch (error) {
    console.error('Add favorite sitter error:', error);
    res.status(500).json({ error: 'Failed to add sitter to favorites' });
  }
});

// Remove sitter from favorites
router.delete('/:sitterId/favorite', verifyToken, async (req, res) => {
  try {
    const { sitterId } = req.params;
    const userId = req.user.userId;

    await pool.query(
      'DELETE FROM favorite_sitters WHERE user_id = $1 AND sitter_id = $2',
      [userId, sitterId]
    );

    res.json({ message: 'Sitter removed from favorites' });

  } catch (error) {
    console.error('Remove favorite sitter error:', error);
    res.status(500).json({ error: 'Failed to remove sitter from favorites' });
  }
});

// ========== CREATE/UPDATE SITTER PROFILE ==========
router.post('/profile', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    const {
      experience_years,
      skills,
      languages,
      hourly_rate,
      daily_rate,
      is_available,
      available_from,
      available_to,
      bio,
      location,
      country
    } = req.body;

    if (req.user.role !== 'sitter') {
      return res.status(403).json({ error: 'Only sitters can create/update sitter profiles' });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Update user bio, location, country if provided
      if (bio || location || country) {
        const userUpdates = [];
        const userValues = [];
        let paramCount = 1;
        
        if (bio) {
          userUpdates.push(`bio = $${paramCount}`);
          userValues.push(bio);
          paramCount++;
        }
        if (location) {
          userUpdates.push(`location = $${paramCount}`);
          userValues.push(location);
          paramCount++;
        }
        if (country) {
          userUpdates.push(`country = $${paramCount}`);
          userValues.push(country);
          paramCount++;
        }
        
        if (userUpdates.length > 0) {
          userValues.push(req.user.userId);
          const userQuery = `UPDATE users SET ${userUpdates.join(', ')}, updated_at = NOW() WHERE id = $${paramCount}`;
          await client.query(userQuery, userValues);
        }
      }

      // Handle avatar upload
      if (req.file) {
        const avatarUrl = `/uploads/sitters/${req.file.filename}`;
        await client.query(
          'UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2',
          [avatarUrl, req.user.userId]
        );
      }

      // Parse JSON fields
      let skillsArray = [];
      let languagesArray = [];
      
      if (skills) {
        try {
          skillsArray = typeof skills === 'string' ? JSON.parse(skills) : skills;
        } catch {
          skillsArray = skills.split(',').map(c => c.trim());
        }
      }
      
      if (languages) {
        try {
          languagesArray = typeof languages === 'string' ? JSON.parse(languages) : languages;
        } catch {
          languagesArray = languages.split(',').map(l => l.trim());
        }
      }

      // Check if sitter profile exists
// In the POST /profile route, update the INSERT
if (existingResult.rows.length > 0) {
  // Update existing profile
  const sitterId = existingResult.rows[0].id;
  
  const updateFields = [];
  const updateValues = [];
  let paramCount = 1;
  
  if (experience_years !== undefined) {
    updateFields.push(`experience_years = $${paramCount}`);
    updateValues.push(parseInt(experience_years));
    paramCount++;
  }
  
  if (skills !== undefined) {
    updateFields.push(`skills = $${paramCount}`);
    updateValues.push(JSON.stringify(skillsArray));
    paramCount++;
  }
  
  if (languages !== undefined) {
    updateFields.push(`languages = $${paramCount}`);
    updateValues.push(JSON.stringify(languagesArray));
    paramCount++;
  }
  
  if (hourly_rate !== undefined) {
    updateFields.push(`hourly_rate = $${paramCount}`);
    updateValues.push(parseFloat(hourly_rate));
    paramCount++;
  }
  
  if (daily_rate !== undefined) {
    updateFields.push(`daily_rate = $${paramCount}`);
    updateValues.push(parseFloat(daily_rate));
    paramCount++;
  }
  
  if (is_available !== undefined) {
    updateFields.push(`is_available = $${paramCount}`);
    updateValues.push(is_available);
    paramCount++;
  }
  
  if (available_from) {
    updateFields.push(`available_from = $${paramCount}`);
    updateValues.push(available_from);
    paramCount++;
  }
  
  if (available_to) {
    updateFields.push(`available_to = $${paramCount}`);
    updateValues.push(available_to);
    paramCount++;
  }
  
  // New fields
  if (city !== undefined) {
    updateFields.push(`city = $${paramCount}`);
    updateValues.push(city);
    paramCount++;
  }
  
  if (location !== undefined) {
    updateFields.push(`location = $${paramCount}`);
    updateValues.push(location);
    paramCount++;
  }
  
  if (latitude !== undefined) {
    updateFields.push(`latitude = $${paramCount}`);
    updateValues.push(parseFloat(latitude));
    paramCount++;
  }
  
  if (longitude !== undefined) {
    updateFields.push(`longitude = $${paramCount}`);
    updateValues.push(parseFloat(longitude));
    paramCount++;
  }

  if (updateFields.length > 0) {
    updateValues.push(sitterId);
    const updateQuery = `UPDATE sitters SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount}`;
    await client.query(updateQuery, updateValues);
  }
} else {
  // Create new profile
  const sitterId = uuidv4();
  
  await client.query(
    `INSERT INTO sitters (
      id, user_id, experience_years, skills, languages,
      hourly_rate, daily_rate, is_available, available_from, available_to,
      city, location, latitude, longitude
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      sitterId,
      req.user.userId,
      parseInt(experience_years) || 0,
      JSON.stringify(skillsArray),
      JSON.stringify(languagesArray),
      hourly_rate ? parseFloat(hourly_rate) : null,
      daily_rate ? parseFloat(daily_rate) : null,
      is_available !== undefined ? is_available : true,
      available_from || null,
      available_to || null,
      city || null,
      location || null,
      latitude ? parseFloat(latitude) : null,
      longitude ? parseFloat(longitude) : null
    ]
  );
}

      if (existingResult.rows.length > 0) {
        // Update existing profile
        const sitterId = existingResult.rows[0].id;
        
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;
        
        if (experience_years !== undefined) {
          updateFields.push(`experience_years = $${paramCount}`);
          updateValues.push(parseInt(experience_years));
          paramCount++;
        }
        
        if (skills !== undefined) {
          updateFields.push(`skills = $${paramCount}`);
          updateValues.push(JSON.stringify(skillsArray));
          paramCount++;
        }
        
        if (languages !== undefined) {
          updateFields.push(`languages = $${paramCount}`);
          updateValues.push(JSON.stringify(languagesArray));
          paramCount++;
        }
        
        if (hourly_rate !== undefined) {
          updateFields.push(`hourly_rate = $${paramCount}`);
          updateValues.push(parseFloat(hourly_rate));
          paramCount++;
        }
        
        if (daily_rate !== undefined) {
          updateFields.push(`daily_rate = $${paramCount}`);
          updateValues.push(parseFloat(daily_rate));
          paramCount++;
        }
        
        if (is_available !== undefined) {
          updateFields.push(`is_available = $${paramCount}`);
          updateValues.push(is_available);
          paramCount++;
        }
        
        if (available_from) {
          updateFields.push(`available_from = $${paramCount}`);
          updateValues.push(available_from);
          paramCount++;
        }
        
        if (available_to) {
          updateFields.push(`available_to = $${paramCount}`);
          updateValues.push(available_to);
          paramCount++;
        }

        if (updateFields.length > 0) {
          updateValues.push(sitterId);
          const updateQuery = `UPDATE sitters SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount}`;
          await client.query(updateQuery, updateValues);
        }

        res.json({
          message: 'Sitter profile updated successfully',
          sitterId: sitterId
        });

      } else {
        // Create new profile
        const sitterId = uuidv4();
        
        await client.query(
          `INSERT INTO sitters (
            id, user_id, experience_years, skills, languages,
            hourly_rate, daily_rate, is_available, available_from, available_to
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            sitterId,
            req.user.userId,
            parseInt(experience_years) || 0,
            JSON.stringify(skillsArray),
            JSON.stringify(languagesArray),
            hourly_rate ? parseFloat(hourly_rate) : null,
            daily_rate ? parseFloat(daily_rate) : null,
            is_available !== undefined ? is_available : true,
            available_from || null,
            available_to || null
          ]
        );

        res.status(201).json({
          message: 'Sitter profile created successfully',
          sitterId: sitterId
        });
      }

      await client.query('COMMIT');

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Create/update sitter profile error:', error);
    res.status(500).json({ 
      error: 'Failed to create/update sitter profile',
      details: error.message 
    });
  }
});

// ========== GET ALL SITTERS ==========
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      location,
      country,
      min_rating,
      min_experience,
      languages,
      is_available,
      search,
      sort_by = 'rating',
      sort_order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let whereConditions = ['u.role = $1'];
    let values = ['sitter'];
    let paramCount = 2;

    if (location) {
      whereConditions.push(`u.location ILIKE $${paramCount}`);
      values.push(`%${location}%`);
      paramCount++;
    }
    
    if (country) {
      whereConditions.push(`u.country ILIKE $${paramCount}`);
      values.push(`%${country}%`);
      paramCount++;
    }
    
    if (min_experience) {
      whereConditions.push(`COALESCE(s.experience_years, 0) >= $${paramCount}`);
      values.push(parseInt(min_experience));
      paramCount++;
    }
    
    if (is_available === 'true') {
      whereConditions.push(`COALESCE(s.is_available, true) = true`);
    }
    
    if (search) {
      whereConditions.push(`(
        u.name ILIKE $${paramCount} OR 
        u.email ILIKE $${paramCount} OR 
        u.bio ILIKE $${paramCount} OR 
        u.location ILIKE $${paramCount} OR 
        u.country ILIKE $${paramCount}
      )`);
      values.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Build ORDER BY
    let orderBy = '(SELECT COALESCE(AVG(r.rating), 0) FROM reviews r WHERE r.reviewee_id = u.id) DESC';
    if (sort_by === 'experience') {
      orderBy = 'COALESCE(s.experience_years, 0) DESC';
    } else if (sort_by === 'newest') {
      orderBy = 'u.created_at DESC';
    }

   // In the GET / route, update the SELECT to include the new fields
const sittersResult = await pool.query(`
  SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    u.country,
    u.bio,
    u.avatar_url,
    u.created_at,
    u.location as user_location,
    s.id as sitter_id,
    s.experience_years,
    s.skills,
    s.languages,
    s.is_available,
    s.available_from,
    s.available_to,
    s.city,              -- New field from sitters table
    s.location,           -- New field from sitters table
    s.latitude,           -- New field from sitters table
    s.longitude,          -- New field from sitters table
    (
      SELECT COALESCE(AVG(r.rating), 0)
      FROM reviews r
      WHERE r.reviewee_id = u.id
    ) as avg_rating,
    (
      SELECT COUNT(*)
      FROM reviews r
      WHERE r.reviewee_id = u.id
    ) as total_reviews,
    (
      SELECT COUNT(*)
      FROM arrangements a
      WHERE a.sitter_id = u.id AND a.status = 'completed'
    ) as completed_arrangements
  FROM users u
  LEFT JOIN sitters s ON u.id = s.user_id
  WHERE ${whereClause}
  GROUP BY u.id, s.id
  ORDER BY ${orderBy}
  LIMIT $${paramCount} OFFSET $${paramCount + 1}
`, [...values, parseInt(limit), offset]);
    // Get total count
    const countResult = await pool.query(`
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      LEFT JOIN sitters s ON u.id = s.user_id
      WHERE ${whereClause}
    `, values.slice(0, values.length));

    // Process JSON fields
   const processedSitters = sittersResult.rows.map(sitter => {
  const languages = sitter.languages ? JSON.parse(sitter.languages) : [];
  const skills = sitter.skills ? JSON.parse(sitter.skills) : [];
  
  return {
    id: sitter.id,
    name: sitter.name,
    email: sitter.email,
    phone: sitter.phone,
    country: sitter.country,
    bio: sitter.bio,
    avatar_url: sitter.avatar_url,
    avatar: sitter.avatar_url,
    location: sitter.location || sitter.user_location || '',  // Use sitter's location first, then user's location
    city: sitter.city || '',                                   // New field
    latitude: sitter.latitude ? parseFloat(sitter.latitude) : null,
    longitude: sitter.longitude ? parseFloat(sitter.longitude) : null,
    languages: languages,
    skills: skills,
    credentials: skills,
    rating: parseFloat(sitter.avg_rating) || 0,
    avg_rating: parseFloat(sitter.avg_rating) || 0,
    total_reviews: parseInt(sitter.total_reviews) || 0,
    completed_arrangements: parseInt(sitter.completed_arrangements) || 0,
    experience_years: parseInt(sitter.experience_years) || 0,
    is_available: sitter.is_available === true,
    total_sits: parseInt(sitter.completed_arrangements) || 0,
    created_at: sitter.created_at
  };
});
    res.json({
      data: processedSitters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(parseInt(countResult.rows[0].total) / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get sitters error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sitters',
      details: error.message 
    });
  }
});

// ========== GET SINGLE SITTER - THIS COMES AFTER SPECIFIC ROUTES ==========
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid sitter ID format' });
    }

    const sitterResult = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.country,
        u.bio,
        u.avatar_url,
        u.created_at,
        u.location,
        s.id as sitter_id,
        s.experience_years,
        s.skills,
        s.languages,
        s.is_available,
        s.available_from,
        s.available_to,
        (
          SELECT COALESCE(AVG(r.rating), 0)
          FROM reviews r
          WHERE r.reviewee_id = u.id
        ) as avg_rating,
        (
          SELECT COUNT(*)
          FROM reviews r
          WHERE r.reviewee_id = u.id
        ) as total_reviews,
        (
          SELECT COUNT(*)
          FROM arrangements a
          WHERE a.sitter_id = u.id AND a.status = 'completed'
        ) as completed_arrangements
      FROM users u
      LEFT JOIN sitters s ON u.id = s.user_id
      WHERE u.id = $1 AND u.role = 'sitter'
      LIMIT 1
    `, [id]);

    if (sitterResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sitter not found' });
    }

    const sitter = sitterResult.rows[0];
    
    const languages = sitter.languages ? JSON.parse(sitter.languages) : [];
    const skills = sitter.skills ? JSON.parse(sitter.skills) : [];

    const sitterResponse = {
      id: sitter.id,
      name: sitter.name,
      email: sitter.email,
      phone: sitter.phone,
      phone_number: sitter.phone,
      country: sitter.country,
      bio: sitter.bio,
      avatar_url: sitter.avatar_url,
      avatar: sitter.avatar_url,
      location: sitter.location,
      rating: parseFloat(sitter.avg_rating) || 0,
      avg_rating: parseFloat(sitter.avg_rating) || 0,
      total_reviews: parseInt(sitter.total_reviews) || 0,
      completed_arrangements: parseInt(sitter.completed_arrangements) || 0,
      experience_years: parseInt(sitter.experience_years) || 0,
      languages: languages,
      skills: skills,
      credentials: skills,
      is_available: sitter.is_available === true,
      total_sits: parseInt(sitter.completed_arrangements) || 0,
      available_from: sitter.available_from,
      available_to: sitter.available_to,
      created_at: sitter.created_at
    };

    // Get reviews
    const reviewsResult = await pool.query(`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.name as reviewer_name,
        u.avatar_url as reviewer_avatar,
        p.title as property_title
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      LEFT JOIN arrangements a ON r.arrangement_id = a.id
      LEFT JOIN properties p ON a.property_id = p.id
      WHERE r.reviewee_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [sitter.id]);

    sitterResponse.reviews = reviewsResult.rows;

    res.json(sitterResponse);

  } catch (error) {
    console.error('Get sitter error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sitter details',
      details: error.message 
    });
  }
});

export default router;