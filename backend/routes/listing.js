// backend/routes/listing.js
import express from 'express';
import jwt from 'jsonwebtoken';
import listingService from '../services/listingService.js';

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication token required' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      error: 'Invalid or expired token' 
    });
  }
};

// Import listing data from URL
router.post('/import', verifyToken, async (req, res) => {
  try {
    const { url } = req.body;
    
    console.log('📥 Import request for URL:', url);
    
    if (!url) {
      return res.status(400).json({ 
        success: false,
        error: 'URL is required' 
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid URL format' 
      });
    }

    // Fetch listing data
    const result = await listingService.fetchListingData(url);
    
    console.log('✅ Import successful');
    
    res.json(result);

  } catch (error) {
    console.error('❌ Import error:', error);
    
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to import listing'
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    message: 'Listing import API is working',
    timestamp: new Date().toISOString()
  });
});

// Get supported platforms
router.get('/platforms', (req, res) => {
  res.json({
    success: true,
    platforms: [
      { name: 'Airbnb', pattern: 'airbnb.com/rooms/123456' },
      { name: 'Booking.com', pattern: 'booking.com/hotel/name' },
      { name: 'VRBO', pattern: 'vrbo.com/123456' }
    ]
  });
});

export default router;