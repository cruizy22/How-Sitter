// backend/routes/real-listing.js
import express from 'express';
import jwt from 'jsonwebtoken';
import realListingService from '../services/realListingService.js';

const router = express.Router();

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

// Import real listing data
router.post('/import', verifyToken, async (req, res) => {
  try {
    const { url } = req.body;
    
    console.log('📥 REAL IMPORT request for URL:', url);
    
    if (!url) {
      return res.status(400).json({ 
        success: false,
        error: 'URL is required' 
      });
    }

    const result = await realListingService.fetchListingData(url);
    
    console.log('✅ Real import successful');
    res.json(result);

  } catch (error) {
    console.error('❌ Real import error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to import listing'
    });
  }
});

// Test endpoint to check API key
router.get('/test-key', (req, res) => {
  const hasKey = !!process.env.RAPIDAPI_KEY;
  res.json({
    success: true,
    hasApiKey: hasKey,
    message: hasKey ? 'API key is configured' : 'API key is missing',
    keyPrefix: hasKey ? process.env.RAPIDAPI_KEY.substring(0, 10) + '...' : null
  });
});

export default router;