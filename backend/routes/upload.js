// backend/routes/upload.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

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

// Configure multer for property images
const propertyStorage = multer.diskStorage({
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

// Configure multer for temporary uploads
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/temp/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'temp-' + uniqueSuffix + ext);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Create multer instances
const uploadPropertyImage = multer({
  storage: propertyStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: imageFilter
});

const uploadTempImage = multer({
  storage: tempStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter
});

// Upload a single image (temporary - for preview before saving)
router.post('/temp', verifyToken, uploadTempImage.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imageUrl = `/uploads/temp/${req.file.filename}`;
    const fullUrl = getFullImageUrl(imageUrl);

    res.json({
      success: true,
      url: imageUrl,
      fullUrl: fullUrl,
      filename: req.file.filename
    });

  } catch (error) {
    console.error('Temp upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload multiple images (temporary)
router.post('/temp/multiple', verifyToken, uploadTempImage.array('images', 10), (req, res) => {
  try {
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const uploadedFiles = files.map(file => ({
      url: `/uploads/temp/${file.filename}`,
      fullUrl: getFullImageUrl(`/uploads/temp/${file.filename}`),
      filename: file.filename
    }));

    res.json({
      success: true,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Temp multiple upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Upload and save property images directly to a property
router.post('/property/:propertyId', verifyToken, uploadPropertyImage.array('images', 10), async (req, res) => {
  try {
    const { propertyId } = req.params;
    const files = req.files;

    console.log('Upload request received for property:', propertyId);
    console.log('Files received:', files?.length);

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    // Check if property exists and belongs to user
    const propertyCheck = await pool.query(
      'SELECT homeowner_id FROM properties WHERE id = $1',
      [propertyId]
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
        [propertyId]
      );
      const isFirstImage = parseInt(existingImages.rows[0].count) === 0;

      const imageResults = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = `/uploads/properties/${file.filename}`;
        const isPrimary = isFirstImage && i === 0; // First image of first upload is primary
        const displayOrder = parseInt(existingImages.rows[0].count) + i;

        const result = await client.query(
          `INSERT INTO property_images (id, property_id, image_url, is_primary, display_order)
           VALUES ($1, $2, $3, $4, $5) RETURNING id, image_url, is_primary, display_order`,
          [uuidv4(), propertyId, imageUrl, isPrimary, displayOrder]
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
      console.error('Database error:', error);
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Property image upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Delete an image
router.delete('/property/:propertyId/image/:imageId', verifyToken, async (req, res) => {
  try {
    const { propertyId, imageId } = req.params;

    // Check if property exists and belongs to user
    const propertyCheck = await pool.query(
      'SELECT homeowner_id FROM properties WHERE id = $1',
      [propertyId]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (propertyCheck.rows[0].homeowner_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete images from this property' });
    }

    // Get image info to delete file
    const imageResult = await pool.query(
      'SELECT image_url, is_primary FROM property_images WHERE id = $1 AND property_id = $2',
      [imageId, propertyId]
    );

    if (imageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const imageUrl = imageResult.rows[0].image_url;
    const wasPrimary = imageResult.rows[0].is_primary;
    
    // Delete from database
    await pool.query('DELETE FROM property_images WHERE id = $1', [imageId]);

    // Delete file from disk
    const filePath = path.join('uploads', imageUrl.replace('/uploads/', ''));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // If this was the primary image, set another image as primary
    if (wasPrimary) {
      await pool.query(
        `UPDATE property_images SET is_primary = true 
         WHERE property_id = $1 
         ORDER BY display_order LIMIT 1`,
        [propertyId]
      );
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Set primary image
router.put('/property/:propertyId/image/:imageId/primary', verifyToken, async (req, res) => {
  try {
    const { propertyId, imageId } = req.params;

    // Check if property exists and belongs to user
    const propertyCheck = await pool.query(
      'SELECT homeowner_id FROM properties WHERE id = $1',
      [propertyId]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (propertyCheck.rows[0].homeowner_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to modify this property' });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Remove primary from all images
      await client.query(
        'UPDATE property_images SET is_primary = false WHERE property_id = $1',
        [propertyId]
      );

      // Set new primary
      await client.query(
        'UPDATE property_images SET is_primary = true WHERE id = $1 AND property_id = $2',
        [imageId, propertyId]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Primary image updated successfully'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Set primary image error:', error);
    res.status(500).json({ error: 'Failed to set primary image' });
  }
});

// Clean up temp files
router.delete('/temp/cleanup', verifyToken, async (req, res) => {
  try {
    const tempDir = 'uploads/temp/';
    if (!fs.existsSync(tempDir)) {
      return res.json({ message: 'No temp directory found' });
    }

    const files = fs.readdirSync(tempDir);
    let deletedCount = 0;

    // Delete files older than 24 hours
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtimeMs > oneDayMs) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }

    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} temp files`
    });

  } catch (error) {
    console.error('Temp cleanup error:', error);
    res.status(500).json({ error: 'Failed to clean up temp files' });
  }
});

// Test endpoint to check if upload route is working
router.get('/test', (req, res) => {
  res.json({ message: 'Upload API is working' });
});

export default router;