-- database/schema.sql
CREATE DATABASE IF NOT EXISTS howsitter;
USE howsitter;

-- Users table (both homeowners and sitters)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('homeowner', 'sitter', 'admin') NOT NULL,
    phone VARCHAR(20),
    country VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sitter profiles (extends users)
CREATE TABLE sitters (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    experience_years INT DEFAULT 0,
    credentials JSON, -- Stores array of credentials
    languages JSON, -- Stores array of languages
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

-- Property amenities (many-to-many)
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
    reviewer_id VARCHAR(36) NOT NULL, -- who wrote the review
    reviewee_id VARCHAR(36) NOT NULL, -- who is being reviewed
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

-- Messages (for WhatsApp-style communication)
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

-- Saved properties (favorites)
CREATE TABLE saved_properties (
    user_id VARCHAR(36) NOT NULL,
    property_id VARCHAR(36) NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, property_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Sample data insertion
INSERT INTO users (id, email, password_hash, name, role, phone, country, bio, verified) VALUES
-- Homeowners
(UUID(), 'john@example.com', '$2b$10$...', 'John Smith', 'homeowner', '+6512345678', 'Singapore', 'Homeowner with luxury villa in Sentosa', TRUE),
(UUID(), 'sarah@example.com', '$2b$10$...', 'Sarah Chen', 'homeowner', '+6598765432', 'Singapore', 'Family home in Bukit Timah area', TRUE),
-- Sitters
(UUID(), 'maria@example.com', '$2b$10$...', 'Maria Silva', 'sitter', '+5511987654321', 'Brazil', 'Experienced house sitter with 5 years experience', TRUE),
(UUID(), 'james@example.com', '$2b$10$...', 'James Wilson', 'sitter', '+14155551234', 'USA', 'Responsible caretaker with property management background', TRUE);

INSERT INTO sitters (user_id, rating, total_reviews, experience_years, credentials, is_available) VALUES
((SELECT id FROM users WHERE email = 'maria@example.com'), 4.9, 127, 5, '["VRBO Profile", "Global Verified", "First Aid Certified"]', TRUE),
((SELECT id FROM users WHERE email = 'james@example.com'), 4.8, 89, 3, '["LinkedIn Profile", "Background Checked", "Pet Care Certified"]', TRUE);