// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import propertiesRoutes from './routes/properties.js';
import sittersRoutes from './routes/sitters.js';
import uploadRoutes from './routes/upload.js';
import arrangementsRoutes from './routes/arrangements.js';
import listingRoutes from './routes/listing.js';
import realListingRoutes from './routes/real-listing.js';
import apiTestRoutes from './routes/api-test.js';

// Add this with your other imports
import multiAirbnbRoutes from './routes/multi-airbnb.js';
// Add with other imports
import scrapingantRoutes from './routes/scrapingant.js';
import savedPropertiesRoutes from './routes/saved-properties.js';
// Add with other routes

// Add this with your other routes


const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes - All routes should be registered once
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/sitters', sittersRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/arrangements', arrangementsRoutes);
app.use('/api/listing', listingRoutes);
app.use('/api/real-listing', realListingRoutes);
app.use('/api/test', apiTestRoutes);  // Registered once
// Add this with your other routes
app.use('/api/multi-airbnb', multiAirbnbRoutes);
app.use('/api/scrapingant', scrapingantRoutes);
app.use('/api/saved-properties', savedPropertiesRoutes); // Add this line

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      time: result.rows[0].current_time,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database: PostgreSQL`);
  console.log(`📁 Uploads served from: ${path.join(__dirname, 'uploads')}`);
  console.log(`📤 Upload endpoint: http://localhost:${PORT}/api/upload`);
  console.log(`📝 Registered routes:`);
  console.log(`   - /api/auth`);
  console.log(`   - /api/admin`);
  console.log(`   - /api/properties`);
  console.log(`   - /api/sitters`);
  console.log(`   - /api/upload`);
  console.log(`   - /api/arrangements`);
  console.log(`   - /api/listing`);
  console.log(`   - /api/real-listing`);
  console.log(`   - /api/test`);
});