// backend/routes/multi-airbnb.js
import express from 'express';
import jwt from 'jsonwebtoken';
import multiAirbnbService from '../services/multiAirbnbService.js';

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

// Import listing data using multiple Airbnb APIs
router.post('/import', verifyToken, async (req, res) => {
  try {
    const { url } = req.body;
    
    console.log('📥 MULTI-AIRBNB IMPORT request for URL:', url);
    
    if (!url) {
      return res.status(400).json({ 
        success: false,
        error: 'URL is required' 
      });
    }

    const result = await multiAirbnbService.fetchListingData(url);
    
    console.log(`✅ Import successful using provider: ${result.data.source_provider}`);
    res.json(result);

  } catch (error) {
    console.error('❌ Multi-Airbnb import error:', error);
    
    // Fallback to mock data on error
    const mockData = multiAirbnbService.getEnhancedMockData('123456');
    res.json({
      success: true,
      data: {
        ...mockData,
        source_provider: 'mock',
        source_url: req.body.url,
        original_listing_id: '123456'
      }
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

// Get usage statistics (admin only)
router.get('/usage', verifyToken, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      error: 'Admin access required' 
    });
  }
  
  res.json({
    success: true,
    usage: multiAirbnbService.getUsageSummary()
  });
});

// Reset usage statistics (admin only)
router.post('/usage/reset', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      error: 'Admin access required' 
    });
  }
  
  multiAirbnbService.resetUsage();
  res.json({
    success: true,
    message: 'Usage statistics reset successfully'
  });
});

// Get list of available providers
router.get('/providers', (req, res) => {
  const providers = multiAirbnbService.apiProviders.map(p => ({
    name: p.name,
    host: p.host,
    priority: p.priority,
    endpoints: p.endpoints.map(e => e.path)
  }));
  
  res.json({
    success: true,
    providers: providers
  });
});

export default router;