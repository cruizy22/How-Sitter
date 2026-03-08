// backend/routes/scrapingant.js
import express from 'express';
import jwt from 'jsonwebtoken';
import scrapingantService from '../services/scrapingantService.js';

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

// Main import endpoint
router.post('/import', verifyToken, async (req, res) => {
  try {
    const { url } = req.body;
    
    console.log('\n' + '🚀'.repeat(20));
    console.log('SCRAPINGANT IMPORT REQUEST');
    console.log('🚀'.repeat(20));
    console.log('URL:', url);
    console.log('User:', req.user.email);
    
    if (!url) {
      return res.status(400).json({ 
        success: false,
        error: 'URL is required' 
      });
    }

    const result = await scrapingantService.fetchListingData(url);
    
    console.log('\n' + '✅'.repeat(20));
    console.log('IMPORT SUCCESSFUL');
    console.log(`Provider: ${result.data.source_provider}`);
    console.log(`Title: ${result.data.title.substring(0, 50)}...`);
    console.log(`Location: ${result.data.city}, ${result.data.country}`);
    console.log(`Price: $${result.data.price_per_month}/month`);
    console.log('✅'.repeat(20) + '\n');
    
    res.json(result);

  } catch (error) {
    console.error('❌ Import error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Test endpoint to check if service is working
router.get('/test', async (req, res) => {
  try {
    const testUrl = 'https://www.airbnb.com/rooms/1558550319623454948';
    console.log('🧪 Running ScrapingAnt test...');
    
    const result = await scrapingantService.fetchListingData(testUrl);
    
    res.json({
      success: true,
      message: 'Test completed',
      result: {
        provider: result.data.source_provider,
        title: result.data.title,
        location: `${result.data.city}, ${result.data.country}`,
        price: result.data.price_per_month,
        bedrooms: result.data.bedrooms,
        bathrooms: result.data.bathrooms
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Status endpoint
router.get('/status', (req, res) => {
  res.json({
    success: true,
    service: 'ScrapingAnt',
    apiKey: process.env.SCRAPINGANT_API_KEY ? '✅ Configured' : '❌ Missing',
    freeTier: '10,000 requests/month',
    concurrency: 1,
    timestamp: new Date().toISOString()
  });
});

export default router;