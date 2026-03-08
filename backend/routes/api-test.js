// backend/routes/api-test.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

// Simple test to check if route is working
router.get('/ping', (req, res) => {
  res.json({ 
    message: 'API test route is working!',
    timestamp: new Date().toISOString()
  });
});

// Test RapidAPI key
router.get('/check-key', async (req, res) => {
  const API_KEY = process.env.RAPIDAPI_KEY;
  
  if (!API_KEY) {
    return res.json({
      success: false,
      error: 'RAPIDAPI_KEY not found in .env file'
    });
  }

  res.json({
    success: true,
    message: 'API key is configured',
    keyPrefix: API_KEY.substring(0, 10) + '...',
    keyLength: API_KEY.length
  });
});

// Test Airbnb API access
router.get('/test-airbnb', async (req, res) => {
  const API_KEY = process.env.RAPIDAPI_KEY;
  
  const apisToTest = [
    {
      name: 'Airbnb 13',
      host: 'airbnb13.p.rapidapi.com',
      endpoint: '/search-location',
      params: {
        location: 'Paris',
        checkin: '2024-12-01',
        checkout: '2024-12-07',
        adults: '1'
      }
    },
    {
      name: 'Airbnb Scraper',
      host: 'airbnb-scraper.p.rapidapi.com',
      endpoint: '/listings/search',
      params: {
        location: 'Paris',
        checkin: '2024-12-01',
        checkout: '2024-12-07',
        guests: '1'
      }
    }
  ];

  const results = [];

  for (const api of apisToTest) {
    try {
      const options = {
        method: 'GET',
        url: `https://${api.host}${api.endpoint}`,
        params: api.params,
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': api.host
        },
        timeout: 5000
      };

      const response = await axios.request(options);
      results.push({
        name: api.name,
        working: true,
        status: response.status,
        hasData: !!response.data
      });
    } catch (error) {
      results.push({
        name: api.name,
        working: false,
        error: error.message,
        status: error.response?.status
      });
    }
  }

  res.json({
    success: true,
    apiKey: API_KEY ? `${API_KEY.substring(0, 10)}...` : 'missing',
    results
  });
});

export default router;