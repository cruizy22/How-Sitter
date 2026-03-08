-- database.sql - Enhanced with verification and admin features
DROP DATABASE IF EXISTS howsitter;
CREATE DATABASE howsitter;
USE howsitter;

-- Users table with enhanced verification
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('homeowner', 'sitter', 'admin') NOT NULL DEFAULT 'homeowner',
    phone VARCHAR(20),
    country VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    verified BOOLEAN DEFAULT FALSE,
    verification_status ENUM('pending', 'approved', 'rejected', 'under_review') DEFAULT 'pending',
    verification_data JSON, -- For storing Airbnb profile, credit score, etc.
    verification_documents TEXT, -- JSON array of document URLs
    verification_notes TEXT, -- Admin notes
    verified_by VARCHAR(36), -- Admin user ID who verified
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_verification_status (verification_status),
    INDEX idx_verified (verified)
);

-- Sitter profiles with verification details
CREATE TABLE sitters (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    experience_years INT DEFAULT 0,
    credentials JSON, -- {airbnb_verified: true, credit_score: 700, bank_verified: true}
    languages JSON,
    hourly_rate DECIMAL(10,2),
    daily_rate DECIMAL(10,2),
    is_available BOOLEAN DEFAULT TRUE,
    available_from DATE,
    available_to DATE,
    background_check_status ENUM('pending', 'passed', 'failed', 'not_required') DEFAULT 'pending',
    background_check_expiry DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_available (is_available),
    INDEX idx_rating (rating DESC)
);

-- Properties table with verification
CREATE TABLE properties (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    homeowner_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type ENUM('apartment', 'house', 'villa', 'condo', 'townhouse') NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    square_feet INT,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    price_per_month DECIMAL(10,2),
    security_deposit DECIMAL(10,2) DEFAULT 0,
    status ENUM('available', 'occupied', 'maintenance', 'unavailable', 'pending_approval') DEFAULT 'pending_approval',
    verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    verification_notes TEXT,
    verified_by VARCHAR(36),
    verified_at TIMESTAMP NULL,
    availability_start DATE,
    availability_end DATE,
    min_stay_days INT DEFAULT 30,
    max_stay_days INT DEFAULT 365,
    house_rules TEXT,
    website_url VARCHAR(500),
    virtual_tour_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (homeowner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id),
    INDEX idx_location (city, country),
    INDEX idx_status (status),
    INDEX idx_verification_status (verification_status),
    INDEX idx_price (price_per_month)
);

-- Property verification documents
CREATE TABLE property_documents (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    property_id VARCHAR(36) NOT NULL,
    document_type ENUM('ownership', 'photo_id', 'utility_bill', 'property_tax', 'insurance', 'other') NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(36),
    verified_at TIMESTAMP NULL,
    notes TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id),
    INDEX idx_property (property_id),
    INDEX idx_verified (verified)
);

-- Admin verification requests
CREATE TABLE verification_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    entity_type ENUM('user', 'property', 'sitter') NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    request_type ENUM('initial', 'update', 'appeal') DEFAULT 'initial',
    status ENUM('pending', 'approved', 'rejected', 'needs_more_info') DEFAULT 'pending',
    requested_data JSON, -- Data submitted for verification
    admin_notes TEXT,
    reviewed_by VARCHAR(36),
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_entity (entity_type, entity_id)
);

-- Admin audit logs
CREATE TABLE admin_audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    admin_id VARCHAR(36) NOT NULL,
    action_type ENUM('verification', 'property_approval', 'user_management', 'content_moderation', 'system') NOT NULL,
    entity_type ENUM('user', 'property', 'sitter', 'review', 'arrangement') NOT NULL,
    entity_id VARCHAR(36),
    action_details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id),
    INDEX idx_admin (admin_id, created_at),
    INDEX idx_action (action_type, entity_type)
);

-- Add missing columns to existing tables
ALTER TABLE properties 
ADD COLUMN house_rules TEXT AFTER max_stay_days,
ADD COLUMN website_url VARCHAR(500) AFTER house_rules,
ADD COLUMN virtual_tour_url VARCHAR(500) AFTER website_url;

-- Insert default admin user (password: Admin123!)
INSERT INTO users (id, email, password_hash, name, role, verified, verification_status) VALUES 
('11111111-1111-1111-1111-111111111111', 'admin@howsitter.com', '$2b$10$YourHashedPasswordHere', 'System Admin', 'admin', TRUE, 'approved');

-- ... rest of your existing tables (property_amenities, property_images, arrangements, reviews, messages, saved_properties) ...

-- Sitter profiles
CREATE TABLE sitters (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    experience_years INT DEFAULT 0,
    credentials JSON,
    languages JSON,
    hourly_rate DECIMAL(10,2),
    daily_rate DECIMAL(10,2),
    is_available BOOLEAN DEFAULT TRUE,
    available_from DATE,
    available_to DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_available (is_available),
    INDEX idx_rating (rating DESC)
);

-- Properties table
CREATE TABLE properties (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    homeowner_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type ENUM('apartment', 'house', 'villa', 'condo', 'townhouse') NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    square_feet INT,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    price_per_month DECIMAL(10,2),
    security_deposit DECIMAL(10,2) DEFAULT 0,
    status ENUM('available', 'occupied', 'maintenance', 'unavailable') DEFAULT 'available',
    availability_start DATE,
    availability_end DATE,
    min_stay_days INT DEFAULT 30,
    max_stay_days INT DEFAULT 365,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (homeowner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_location (city, country),
    INDEX idx_status (status),
    INDEX idx_price (price_per_month)
);

-- Property amenities
CREATE TABLE property_amenities (
    property_id VARCHAR(36) NOT NULL,
    amenity VARCHAR(50) NOT NULL,
    PRIMARY KEY (property_id, amenity),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Property images
CREATE TABLE property_images (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    property_id VARCHAR(36) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property (property_id)
);

-- Bookings/Arrangements
CREATE TABLE arrangements (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    property_id VARCHAR(36) NOT NULL,
    sitter_id VARCHAR(36) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10,2),
    security_deposit DECIMAL(10,2),
    deposit_paid BOOLEAN DEFAULT FALSE,
    house_rules TEXT,
    special_instructions TEXT,
    homeowner_signed_at TIMESTAMP NULL,
    sitter_signed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (sitter_id) REFERENCES sitters(id),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_status (status)
);

-- Reviews
CREATE TABLE reviews (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    arrangement_id VARCHAR(36) NOT NULL,
    reviewer_id VARCHAR(36) NOT NULL,
    reviewee_id VARCHAR(36) NOT NULL,
    role ENUM('homeowner', 'sitter') NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    response TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (arrangement_id) REFERENCES arrangements(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (reviewee_id) REFERENCES users(id),
    INDEX idx_reviewee (reviewee_id),
    INDEX idx_rating (rating)
);

-- Messages
CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    sender_id VARCHAR(36) NOT NULL,
    receiver_id VARCHAR(36) NOT NULL,
    arrangement_id VARCHAR(36),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (arrangement_id) REFERENCES arrangements(id) ON DELETE SET NULL,
    INDEX idx_conversation (sender_id, receiver_id, created_at DESC)
);

-- Saved properties
CREATE TABLE saved_properties (
    user_id VARCHAR(36) NOT NULL,
    property_id VARCHAR(36) NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, property_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);