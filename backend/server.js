import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Server } from 'socket.io';
import http from 'http';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
  }
});

// ========== MIDDLEWARE ==========
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== DATABASE CONNECTION ==========
console.log('Connecting to database with:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  hasPassword: !!process.env.DB_PASSWORD
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',  // Empty for XAMPP
  database: process.env.DB_NAME || 'howsitter',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful!');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('💡 Make sure:');
    console.log('1. XAMPP MySQL is running (green "Start" button)');
    console.log('2. Database "howsitter" exists in phpMyAdmin');
    console.log('3. .env file has empty password for XAMPP');
  }
})();

// ========== HELPER FUNCTIONS ==========
let testDataChecked = false; // Flag to prevent multiple checks

async function addTestData() {
  try {
    // Only check once
    if (testDataChecked) {
      return;
    }
    
    console.log('📊 Checking for test data...');
    testDataChecked = true;
    
    // Check if we have any users
    const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
      console.log('Adding test users...');
      
      // Add test homeowner
      const homeownerId = uuidv4();
      const homeownerHash = await bcrypt.hash('password123', 10);
      await pool.execute(
        `INSERT INTO users (id, email, password_hash, name, role, country) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [homeownerId, 'homeowner@test.com', homeownerHash, 'John Homeowner', 'homeowner', 'Singapore']
      );
      
      // Add test sitters
      const sitter1Id = uuidv4();
      const sitter1Hash = await bcrypt.hash('password123', 10);
      await pool.execute(
        `INSERT INTO users (id, email, password_hash, name, role, country, bio) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [sitter1Id, 'maria@test.com', sitter1Hash, 'Maria Silva', 'sitter', 'Brazil', 'Experienced house sitter with 5 years of experience']
      );
      
      const sitter2Id = uuidv4();
      const sitter2Hash = await bcrypt.hash('password123', 10);
      await pool.execute(
        `INSERT INTO users (id, email, password_hash, name, role, country, bio) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [sitter2Id, 'james@test.com', sitter2Hash, 'James Wilson', 'sitter', 'USA', 'Responsible caretaker with background in property management']
      );
      
      // Add sitter profiles
      await pool.execute(
        `INSERT INTO sitters (id, user_id, rating, total_reviews, experience_years, is_available) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), sitter1Id, 4.9, 42, 5, 1]
      );
      
      await pool.execute(
        `INSERT INTO sitters (id, user_id, rating, total_reviews, experience_years, is_available) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), sitter2Id, 4.8, 35, 3, 1]
      );
      
      // Add test properties
      const property1Id = uuidv4();
      await pool.execute(
        `INSERT INTO properties (id, homeowner_id, title, description, type, bedrooms, bathrooms, 
         location, city, country, price_per_month, security_deposit) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [property1Id, homeownerId, 'Luxury Villa with Pool', 
         'Beautiful luxury villa with swimming pool, garden, and modern amenities. Perfect for long-term stays.',
         'villa', 4, 3, 'Sentosa Cove', 'Singapore', 'Singapore', 3500, 700]
      );
      
      const property2Id = uuidv4();
      await pool.execute(
        `INSERT INTO properties (id, homeowner_id, title, description, type, bedrooms, bathrooms, 
         location, city, country, price_per_month, security_deposit) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [property2Id, homeownerId, 'Modern City Apartment', 
         'Stylish apartment in the heart of the city with great views and convenient location.',
         'apartment', 2, 1, 'Orchard Road', 'Singapore', 'Singapore', 2200, 500]
      );
      
      // Add amenities
      const amenities1 = ['pool', 'garden', 'wifi', 'parking', 'ac', 'balcony'];
      for (const amenity of amenities1) {
        await pool.execute(
          'INSERT INTO property_amenities (property_id, amenity) VALUES (?, ?)',
          [property1Id, amenity]
        );
      }
      
      const amenities2 = ['wifi', 'gym', 'ac', 'balcony', 'security'];
      for (const amenity of amenities2) {
        await pool.execute(
          'INSERT INTO property_amenities (property_id, amenity) VALUES (?, ?)',
          [property2Id, amenity]
        );
      }
      
      console.log('✅ Test data added successfully!');
    } else {
      console.log('✅ Database already has data');
    }
  } catch (error) {
    console.error('Error adding test data:', error.message);
  }
}

// ========== API ROUTES ==========

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'How Sitter Backend API',
    version: '1.0.0',
    database: 'XAMPP MySQL',
    endpoints: {
      test: '/api/test, /api/test-db',
      auth: '/api/auth/register, /api/auth/login',
      properties: '/api/properties, /api/properties/:id',
      sitters: '/api/sitters, /api/sitters/:id'
    },
    status: 'running'
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const [result] = await pool.execute('SELECT 1 as connected');
    const [tables] = await pool.execute('SHOW TABLES');
    
    res.json({ 
      database: 'connected',
      tables: tables.map(t => t[Object.keys(t)[0]]),
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      database: 'disconnected',
      error: error.message,
      suggestion: 'Check XAMPP MySQL is running and .env file'
    });
  }
});

// ========== CREATE PROPERTY ENDPOINT (SINGLE VERSION - REMOVED DUPLICATE) ==========
app.post('/api/properties', async (req, res) => {
  console.log('🚀 CREATE PROPERTY ENDPOINT CALLED');
  console.log('📦 Request body:', req.body);
  console.log('🔑 Headers:', req.headers);
  
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
      longitude,
      availability_start,
      availability_end
    } = req.body;

    console.log('📊 Parsed data:', {
      title, 
      type, 
      bedrooms, 
      location, 
      city, 
      country, 
      price_per_month,
      amenities
    });

    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'Authentication required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('✅ Decoded token:', { userId: decoded.userId, role: decoded.role });
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const homeownerId = decoded.userId;

    // Check if user is a homeowner
    if (decoded.role !== 'homeowner') {
      console.log('❌ User is not homeowner, role:', decoded.role);
      return res.status(403).json({ error: 'Only homeowners can list properties' });
    }

    // Validate required fields
    if (!title || !description || !location || !city || !country || !price_per_month) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields: title, description, location, city, country, and price_per_month are required' 
      });
    }

    // Create property ID
    const propertyId = uuidv4();
    console.log('🆔 Creating property with ID:', propertyId);
    
    // Insert into database
    await pool.execute(
      `INSERT INTO properties (
        id, homeowner_id, title, description, type, bedrooms, bathrooms,
        location, city, country, price_per_month, security_deposit,
        square_feet, min_stay_days, max_stay_days, rules, website_url,
        virtual_tour_url, latitude, longitude, availability_start, availability_end, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        propertyId,
        homeownerId,
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
        longitude || null,
        availability_start || null,
        availability_end || null
      ]
    );

    console.log('✅ Property created in database');

    // Add amenities
    if (amenities && Array.isArray(amenities) && amenities.length > 0) {
      console.log('➕ Adding amenities:', amenities);
      for (const amenity of amenities) {
        if (amenity && amenity.trim()) {
          await pool.execute(
            'INSERT INTO property_amenities (property_id, amenity) VALUES (?, ?)',
            [propertyId, amenity.trim()]
          );
        }
      }
      console.log('✅ Amenities added');
    } else {
      console.log('⚠️ No amenities to add');
    }

    console.log('🎉 Property creation successful');
    
    res.status(201).json({
      message: 'Property listed successfully and is pending verification',
      propertyId: propertyId,
      status: 'pending'
    });
  } catch (error) {
    console.error('❌ Create property error:', error);
    console.error('🔍 Error details:', error.message);
    console.error('📋 Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to create property',
      details: error.message 
    });
  }
});

// ========== GET PROPERTIES ==========
app.get('/api/properties', async (req, res) => {
  try {
    // Add test data if needed (only runs once due to flag)
    await addTestData();
    
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    
    // Get properties with homeowner info
    const [properties] = await pool.execute(`
      SELECT p.*, u.name as homeowner_name, u.country as homeowner_country
      FROM properties p
      LEFT JOIN users u ON p.homeowner_id = u.id
      WHERE p.status = 'available'
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), offset]);
    
    // Get amenities for each property
    for (const property of properties) {
      const [amenities] = await pool.execute(
        'SELECT amenity FROM property_amenities WHERE property_id = ?',
        [property.id]
      );
      property.amenities = amenities.map(a => a.amenity);
    }
    
    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM properties WHERE status = "available"'
    );
    const total = countResult[0].total;
    
    res.json({
      properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get properties error:', error);
    
    // Fallback to mock data
    res.json({
      properties: [
        {
          id: 'fallback-1',
          title: 'Luxury Villa',
          description: 'Beautiful villa with pool',
          type: 'villa',
          bedrooms: 4,
          bathrooms: 3,
          location: 'Sentosa, Singapore',
          city: 'Singapore',
          country: 'Singapore',
          price_per_month: 3500,
          security_deposit: 700,
          status: 'available',
          amenities: ['pool', 'garden', 'wifi'],
          homeowner_name: 'John Homeowner'
        }
      ],
      pagination: {
        page: 1,
        limit: 12,
        total: 1,
        pages: 1
      },
      message: 'Using fallback data due to database error'
    });
  }
});

// ========== GET SINGLE PROPERTY ==========
app.get('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get property details
    const [properties] = await pool.execute(
      `SELECT p.*, u.name as homeowner_name, u.email as homeowner_email, 
              u.country as homeowner_country, u.bio as homeowner_bio,
              u.avatar_url as homeowner_avatar
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
      'SELECT * FROM property_images WHERE property_id = ? ORDER BY display_order, uploaded_at',
      [id]
    );
    property.images = images;

    res.json(property);
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// ========== AUTHENTICATION ROUTES ==========
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role, country } = req.body;
    
    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Create user
    const userId = uuidv4();
    await pool.execute(
      `INSERT INTO users (id, email, password_hash, name, role, country) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, email, passwordHash, name, role, country]
    );
    
    // If sitter, create sitter profile
    if (role === 'sitter') {
      await pool.execute(
        'INSERT INTO sitters (id, user_id) VALUES (?, ?)',
        [uuidv4(), userId]
      );
    }
    
    // Generate token
    const token = jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, email, name, role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get user
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ========== GET SITTERS ==========
app.get('/api/sitters', async (req, res) => {
  try {
    // Add test data if needed (only runs once due to flag)
    await addTestData();
    
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    
    const [sitters] = await pool.execute(`
      SELECT s.*, u.name, u.email, u.country, u.bio, u.avatar_url
      FROM sitters s
      JOIN users u ON s.user_id = u.id
      WHERE s.is_available = 1
      ORDER BY s.rating DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), offset]);
    
    // Format the response
    const formattedSitters = sitters.map(sitter => ({
      id: sitter.id,
      name: sitter.name,
      email: sitter.email,
      country: sitter.country,
      bio: sitter.bio,
      rating: sitter.rating,
      total_reviews: sitter.total_reviews,
      experience_years: sitter.experience_years,
      is_available: sitter.is_available,
      avatar_url: sitter.avatar_url
    }));
    
    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM sitters WHERE is_available = 1'
    );
    const total = countResult[0].total;
    
    res.json({
      sitters: formattedSitters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get sitters error:', error);
    
    // Fallback to mock data
    res.json({
      sitters: [
        {
          id: 'fallback-1',
          name: 'Maria Silva',
          country: 'Brazil',
          bio: 'Experienced house sitter',
          rating: 4.9,
          total_reviews: 42,
          experience_years: 5,
          is_available: true
        },
        {
          id: 'fallback-2',
          name: 'James Wilson',
          country: 'USA',
          bio: 'Responsible caretaker',
          rating: 4.8,
          total_reviews: 35,
          experience_years: 3,
          is_available: true
        }
      ],
      pagination: {
        page: 1,
        limit: 12,
        total: 2,
        pages: 1
      }
    });
  }
});

// ========== WEB SOCKETS ==========
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ========== PROPERTY IMAGES ==========
app.get('/api/properties/:id/images', async (req, res) => {
  try {
    const { id } = req.params;
    const [images] = await pool.execute(
      'SELECT * FROM property_images WHERE property_id = ? ORDER BY display_order, uploaded_at',
      [id]
    );
    res.json({ images });
  } catch (error) {
    console.error('Get property images error:', error);
    res.status(500).json({ error: 'Failed to fetch property images' });
  }
});

// ========== BOOKINGS/ARRANGEMENTS ==========
// Create booking/arrangement
app.post('/api/bookings', async (req, res) => {
  try {
    const { propertyId, startDate, endDate, message, houseRules, specialInstructions } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const sitterId = decoded.userId;

    // Check if user is a sitter
    if (decoded.role !== 'sitter') {
      return res.status(403).json({ error: 'Only sitters can create bookings' });
    }

    // Get sitter profile
    const [sitters] = await pool.execute(
      'SELECT id FROM sitters WHERE user_id = ?',
      [sitterId]
    );
    
    if (sitters.length === 0) {
      return res.status(403).json({ error: 'Sitter profile not found' });
    }

    const sitterProfileId = sitters[0].id;

    // Check if property exists and is available
    const [properties] = await pool.execute(
      `SELECT p.*, u.name as homeowner_name, u.email as homeowner_email 
       FROM properties p 
       JOIN users u ON p.homeowner_id = u.id 
       WHERE p.id = ? AND p.status = 'available'`,
      [propertyId]
    );

    if (properties.length === 0) {
      return res.status(404).json({ error: 'Property not available' });
    }

    const property = properties[0];
    
    // Check for date conflicts
    const [existingArrangements] = await pool.execute(
      `SELECT * FROM arrangements 
       WHERE property_id = ? 
       AND status IN ('pending', 'confirmed', 'active')
       AND (
         (start_date <= ? AND end_date >= ?) OR
         (start_date <= ? AND end_date >= ?) OR
         (start_date >= ? AND end_date <= ?)
       )`,
      [propertyId, endDate, startDate, endDate, startDate, startDate, endDate]
    );

    if (existingArrangements.length > 0) {
      return res.status(400).json({ error: 'Property not available for selected dates' });
    }

    // Calculate total amount (price per month * months)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30));
    const totalAmount = property.price_per_month * months;

    // Create arrangement
    const arrangementId = uuidv4();
    await pool.execute(
      `INSERT INTO arrangements (id, property_id, sitter_id, start_date, end_date, 
       total_amount, security_deposit, house_rules, special_instructions, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [arrangementId, propertyId, sitterProfileId, startDate, endDate, 
       totalAmount, property.security_deposit, houseRules, specialInstructions]
    );

    // Create initial message
    const messageId = uuidv4();
    await pool.execute(
      `INSERT INTO messages (id, sender_id, receiver_id, arrangement_id, message) 
       VALUES (?, ?, ?, ?, ?)`,
      [messageId, sitterId, property.homeowner_id, arrangementId, 
       message || 'Hi, I would like to arrange house sitting for your property.']
    );

    res.status(201).json({
      message: 'Booking request sent successfully',
      arrangementId,
      status: 'pending',
      totalAmount
    });
  } catch (error) {
    console.error('Create booking error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user's arrangements
app.get('/api/arrangements', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.userId;
    const userRole = decoded.role;

    let arrangements;
    if (userRole === 'homeowner') {
      [arrangements] = await pool.execute(
        `SELECT a.*, p.title as property_title, p.location, p.city, p.country, 
                p.price_per_month, p.security_deposit as property_security_deposit,
                s.user_id as sitter_user_id, u.name as sitter_name, u.email as sitter_email, 
                u.country as sitter_country, u.avatar_url as sitter_avatar
         FROM arrangements a
         JOIN properties p ON a.property_id = p.id
         JOIN sitters s ON a.sitter_id = s.id
         JOIN users u ON s.user_id = u.id
         WHERE p.homeowner_id = ?
         ORDER BY a.created_at DESC`,
        [userId]
      );
    } else if (userRole === 'sitter') {
      // Get sitter profile ID first
      const [sitters] = await pool.execute(
        'SELECT id FROM sitters WHERE user_id = ?',
        [userId]
      );
      
      if (sitters.length === 0) {
        return res.json({ arrangements: [] });
      }
      
      const sitterId = sitters[0].id;
      
      [arrangements] = await pool.execute(
        `SELECT a.*, p.title as property_title, p.location, p.city, p.country,
                p.price_per_month, p.security_deposit as property_security_deposit,
                u.name as homeowner_name, u.email as homeowner_email, 
                u.avatar_url as homeowner_avatar
         FROM arrangements a
         JOIN properties p ON a.property_id = p.id
         JOIN users u ON p.homeowner_id = u.id
         WHERE a.sitter_id = ?
         ORDER BY a.created_at DESC`,
        [sitterId]
      );
    } else {
      return res.status(403).json({ error: 'Invalid role' });
    }

    // Get messages count for each arrangement
    for (let arrangement of arrangements) {
      const [messages] = await pool.execute(
        'SELECT COUNT(*) as count FROM messages WHERE arrangement_id = ?',
        [arrangement.id]
      );
      arrangement.message_count = messages[0].count;
    }

    res.json({ arrangements });
  } catch (error) {
    console.error('Get arrangements error:', error);
    res.status(500).json({ error: 'Failed to fetch arrangements' });
  }
});

// Update arrangement status
app.put('/api/arrangements/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.userId;

    // Check if user has permission (must be homeowner of the property)
    const [arrangements] = await pool.execute(
      `SELECT a.* FROM arrangements a
       JOIN properties p ON a.property_id = p.id
       WHERE a.id = ? AND p.homeowner_id = ?`,
      [id, userId]
    );

    if (arrangements.length === 0) {
      return res.status(404).json({ error: 'Arrangement not found or unauthorized' });
    }

    await pool.execute(
      'UPDATE arrangements SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    // If confirmed, update property status
    if (status === 'confirmed') {
      const arrangement = arrangements[0];
      await pool.execute(
        'UPDATE properties SET status = "occupied" WHERE id = ?',
        [arrangement.property_id]
      );
    }

    res.json({ message: 'Arrangement status updated successfully' });
  } catch (error) {
    console.error('Update arrangement error:', error);
    res.status(500).json({ error: 'Failed to update arrangement' });
  }
});

// ========== MESSAGES ==========
app.get('/api/arrangements/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.userId;

    // Check if user has permission to view messages
    const [arrangements] = await pool.execute(
      `SELECT a.*, p.homeowner_id, s.user_id as sitter_user_id 
       FROM arrangements a
       JOIN properties p ON a.property_id = p.id
       JOIN sitters s ON a.sitter_id = s.id
       WHERE a.id = ? AND (p.homeowner_id = ? OR s.user_id = ?)`,
      [id, userId, userId]
    );

    if (arrangements.length === 0) {
      return res.status(404).json({ error: 'Arrangement not found or unauthorized' });
    }

    const [messages] = await pool.execute(
      `SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.arrangement_id = ?
       ORDER BY m.created_at ASC`,
      [id]
    );

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/arrangements/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const senderId = decoded.userId;

    // Check if user has permission to send messages
    const [arrangements] = await pool.execute(
      `SELECT a.*, p.homeowner_id, s.user_id as sitter_user_id 
       FROM arrangements a
       JOIN properties p ON a.property_id = p.id
       JOIN sitters s ON a.sitter_id = s.id
       WHERE a.id = ? AND (p.homeowner_id = ? OR s.user_id = ?)`,
      [id, senderId, senderId]
    );

    if (arrangements.length === 0) {
      return res.status(404).json({ error: 'Arrangement not found or unauthorized' });
    }

    const arrangement = arrangements[0];
    const receiverId = senderId === arrangement.homeowner_id ? arrangement.sitter_user_id : arrangement.homeowner_id;

    const messageId = uuidv4();
    await pool.execute(
      `INSERT INTO messages (id, sender_id, receiver_id, arrangement_id, message) 
       VALUES (?, ?, ?, ?, ?)`,
      [messageId, senderId, receiverId, id, message]
    );

    res.status(201).json({ 
      message: 'Message sent successfully',
      messageId 
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ========== USER PROFILE ==========
app.get('/api/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.userId;

    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    
    // Remove sensitive data
    delete user.password_hash;

    // Get additional data based on role
    if (user.role === 'homeowner') {
      const [properties] = await pool.execute(
        'SELECT COUNT(*) as property_count FROM properties WHERE homeowner_id = ?',
        [userId]
      );
      user.property_count = properties[0].property_count;
    } else if (user.role === 'sitter') {
      const [sitters] = await pool.execute(
        `SELECT s.*, COUNT(DISTINCT a.id) as arrangement_count,
                AVG(r.rating) as avg_rating, COUNT(r.id) as review_count
         FROM sitters s
         LEFT JOIN arrangements a ON s.id = a.sitter_id
         LEFT JOIN reviews r ON s.user_id = r.reviewee_id AND r.role = 'sitter'
         WHERE s.user_id = ?
         GROUP BY s.id`,
        [userId]
      );
      
      if (sitters.length > 0) {
        user.sitter_profile = sitters[0];
      }
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ========== SAVED PROPERTIES ==========
app.get('/api/saved-properties', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.userId;

    const [savedProperties] = await pool.execute(
      `SELECT p.*, u.name as homeowner_name
       FROM saved_properties sp
       JOIN properties p ON sp.property_id = p.id
       JOIN users u ON p.homeowner_id = u.id
       WHERE sp.user_id = ?
       ORDER BY sp.saved_at DESC`,
      [userId]
    );

    // Get amenities for each property
    for (let property of savedProperties) {
      const [amenities] = await pool.execute(
        'SELECT amenity FROM property_amenities WHERE property_id = ?',
        [property.id]
      );
      property.amenities = amenities.map(a => a.amenity);
    }

    res.json({ properties: savedProperties });
  } catch (error) {
    console.error('Get saved properties error:', error);
    res.status(500).json({ error: 'Failed to fetch saved properties' });
  }
});

app.post('/api/properties/:id/save', async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.userId;

    // Check if property exists
    const [properties] = await pool.execute(
      'SELECT id FROM properties WHERE id = ?',
      [id]
    );

    if (properties.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if already saved
    const [existing] = await pool.execute(
      'SELECT * FROM saved_properties WHERE user_id = ? AND property_id = ?',
      [userId, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Property already saved' });
    }

    await pool.execute(
      'INSERT INTO saved_properties (user_id, property_id) VALUES (?, ?)',
      [userId, id]
    );

    res.json({ message: 'Property saved successfully' });
  } catch (error) {
    console.error('Save property error:', error);
    res.status(500).json({ error: 'Failed to save property' });
  }
});

app.delete('/api/properties/:id/save', async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.userId;

    await pool.execute(
      'DELETE FROM saved_properties WHERE user_id = ? AND property_id = ?',
      [userId, id]
    );

    res.json({ message: 'Property removed from saved list' });
  } catch (error) {
    console.error('Unsave property error:', error);
    res.status(500).json({ error: 'Failed to unsave property' });
  }
});

// ========== CATCH-ALL ROUTE (IMPROVED) ==========
app.use((req, res) => {
  console.log(`❌ Endpoint not found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Endpoint not found',
    requested: `${req.method} ${req.url}`,
    available_endpoints: [
      'GET  /',
      'GET  /api/test',
      'GET  /api/test-db',
      'GET  /api/properties',
      'POST /api/properties',
      'GET  /api/properties/:id',
      'GET  /api/properties/:id/images',
      'GET  /api/sitters',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET  /api/profile',
      'GET  /api/saved-properties',
      'POST /api/properties/:id/save',
      'DELETE /api/properties/:id/save',
      'POST /api/bookings',
      'GET  /api/arrangements',
      'GET  /api/arrangements/:id/messages',
      'POST /api/arrangements/:id/messages',
      'PUT  /api/arrangements/:id/status'
    ]
  });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`
  🚀 How Sitter Backend Started!
  =================================
  ✅ Server: http://localhost:${PORT}
  ✅ Frontend: http://localhost:5173
  ✅ Database: XAMPP MySQL
  ✅ Database Name: ${process.env.DB_NAME || 'howsitter'}
  =================================
  `);
  
  // Add test data on startup (only runs once)
  await addTestData();
  
  console.log('\n📋 Test endpoints:');
  console.log(`👉 API Status: http://localhost:${PORT}/`);
  console.log(`👉 Test Database: http://localhost:${PORT}/api/test-db`);
  console.log(`👉 Properties API: http://localhost:${PORT}/api/properties`);
  console.log(`👉 Create Property: POST http://localhost:${PORT}/api/properties`);
  console.log(`👉 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`👉 Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log('\n🔧 Debug: Check browser console and this terminal for logs');
});