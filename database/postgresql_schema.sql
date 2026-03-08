-- PostgreSQL Schema for HowSitter
-- Drop database if exists (run separately in psql or pgAdmin)
-- DROP DATABASE IF EXISTS howsitter;
-- CREATE DATABASE howsitter;
-- \c howsitter;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with enhanced verification
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('homeowner', 'sitter', 'admin')) DEFAULT 'homeowner',
    phone VARCHAR(20),
    whatsapp VARCHAR(20), -- Added for WhatsApp contact
    location VARCHAR(255), -- Added for user location
    city VARCHAR(100),
    country VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(20) CHECK (verification_status IN ('pending', 'approved', 'rejected', 'under_review')) DEFAULT 'pending',
    verification_data JSONB, -- For storing Airbnb profile, credit score, etc.
    verification_documents TEXT, -- JSON array of document URLs
    verification_notes TEXT, -- Admin notes
    verified_by UUID, -- Admin user ID who verified
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Sitter profiles with verification details
CREATE TABLE sitters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    experience_years INTEGER DEFAULT 0,
    credentials JSONB, -- {airbnb_verified: true, credit_score: 700, bank_verified: true}
    languages JSONB,
    skills JSONB, -- Array of skills
    hourly_rate DECIMAL(10,2),
    daily_rate DECIMAL(10,2),
    is_available BOOLEAN DEFAULT TRUE,
    available_from DATE,
    available_to DATE,
    response_rate INTEGER DEFAULT 100,
    response_time INTEGER DEFAULT 1, -- in hours
    total_sits INTEGER DEFAULT 0,
    completed_arrangements INTEGER DEFAULT 0,
    background_check_status VARCHAR(20) CHECK (background_check_status IN ('pending', 'passed', 'failed', 'not_required')) DEFAULT 'pending',
    background_check_expiry DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sitter skills (for better querying)
CREATE TABLE sitter_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sitter_id UUID NOT NULL,
    skill VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sitter_id) REFERENCES sitters(id) ON DELETE CASCADE,
    UNIQUE(sitter_id, skill)
);

-- Sitter languages
CREATE TABLE sitter_languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sitter_id UUID NOT NULL,
    language VARCHAR(50) NOT NULL,
    proficiency VARCHAR(20) DEFAULT 'native',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sitter_id) REFERENCES sitters(id) ON DELETE CASCADE,
    UNIQUE(sitter_id, language)
);

-- Sitter experience
CREATE TABLE sitter_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sitter_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    duration VARCHAR(100),
    start_date DATE,
    end_date DATE,
    property_type VARCHAR(50),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sitter_id) REFERENCES sitters(id) ON DELETE CASCADE
);

-- Properties table with verification
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    homeowner_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('apartment', 'house', 'villa', 'condo', 'townhouse')),
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    square_feet INTEGER,
    location VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    price_per_month DECIMAL(10,2),
    security_deposit DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('available', 'occupied', 'maintenance', 'unavailable', 'pending_approval')) DEFAULT 'pending_approval',
    verification_status VARCHAR(20) CHECK (verification_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    verification_notes TEXT,
    verified_by UUID,
    verified_at TIMESTAMP,
    availability_start DATE,
    availability_end DATE,
    min_stay_days INTEGER DEFAULT 30,
    max_stay_days INTEGER DEFAULT 365,
    house_rules TEXT,
    website_url VARCHAR(500),
    airbnb_url VARCHAR(500), -- Added for Airbnb import
    virtual_tour_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (homeowner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Property verification documents
CREATE TABLE property_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL,
    document_type VARCHAR(20) CHECK (document_type IN ('ownership', 'photo_id', 'utility_bill', 'property_tax', 'insurance', 'other')) NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID,
    verified_at TIMESTAMP,
    notes TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Property amenities
CREATE TABLE property_amenities (
    property_id UUID NOT NULL,
    amenity VARCHAR(50) NOT NULL,
    PRIMARY KEY (property_id, amenity),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Property images
CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Bookings/Arrangements
CREATE TABLE arrangements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL,
    sitter_id UUID NOT NULL,
    homeowner_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')) DEFAULT 'pending',
    total_amount DECIMAL(10,2),
    security_deposit DECIMAL(10,2),
    deposit_paid BOOLEAN DEFAULT FALSE,
    transaction_count INTEGER DEFAULT 0,
    house_rules TEXT,
    special_instructions TEXT,
    homeowner_signed_at TIMESTAMP,
    sitter_signed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (sitter_id) REFERENCES sitters(id),
    FOREIGN KEY (homeowner_id) REFERENCES users(id)
);

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    arrangement_id UUID NOT NULL UNIQUE,
    reviewer_id UUID NOT NULL,
    reviewee_id UUID NOT NULL,
    role VARCHAR(20) CHECK (role IN ('homeowner', 'sitter')) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    response TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (arrangement_id) REFERENCES arrangements(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (reviewee_id) REFERENCES users(id)
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    arrangement_id UUID,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    via_whatsapp BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (arrangement_id) REFERENCES arrangements(id) ON DELETE SET NULL
);

-- Saved properties
CREATE TABLE saved_properties (
    user_id UUID NOT NULL,
    property_id UUID NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, property_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Favorite sitters
CREATE TABLE favorite_sitters (
    user_id UUID NOT NULL,
    sitter_id UUID NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, sitter_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sitter_id) REFERENCES sitters(id) ON DELETE CASCADE
);

-- Admin verification requests
CREATE TABLE verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    entity_type VARCHAR(20) CHECK (entity_type IN ('user', 'property', 'sitter')) NOT NULL,
    entity_id UUID NOT NULL,
    request_type VARCHAR(20) CHECK (request_type IN ('initial', 'update', 'appeal')) DEFAULT 'initial',
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'needs_more_info')) DEFAULT 'pending',
    requested_data JSONB, -- Data submitted for verification
    admin_notes TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Admin audit logs
CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL,
    action_type VARCHAR(20) CHECK (action_type IN ('verification', 'property_approval', 'user_management', 'content_moderation', 'system')) NOT NULL,
    entity_type VARCHAR(20) CHECK (entity_type IN ('user', 'property', 'sitter', 'review', 'arrangement')) NOT NULL,
    entity_id UUID,
    action_details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Discovery verification for sitters
CREATE TABLE sitter_discovery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sitter_id UUID NOT NULL UNIQUE,
    airbnb_profile VARCHAR(500),
    airbnb_verified BOOLEAN DEFAULT FALSE,
    credit_score INTEGER,
    credit_score_verified BOOLEAN DEFAULT FALSE,
    bank_statement VARCHAR(500),
    bank_verified BOOLEAN DEFAULT FALSE,
    linkedin_profile VARCHAR(500),
    linkedin_verified BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    verified_by UUID,
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    notes TEXT,
    FOREIGN KEY (sitter_id) REFERENCES sitters(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_verification_status ON users(verification_status);
CREATE INDEX idx_users_verified ON users(verified);

CREATE INDEX idx_sitters_user_id ON sitters(user_id);
CREATE INDEX idx_sitters_available ON sitters(is_available);
CREATE INDEX idx_sitters_rating ON sitters(rating DESC);

CREATE INDEX idx_properties_homeowner ON properties(homeowner_id);
CREATE INDEX idx_properties_location ON properties(city, country);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_verification_status ON properties(verification_status);
CREATE INDEX idx_properties_price ON properties(price_per_month);

CREATE INDEX idx_property_amenities_property ON property_amenities(property_id);
CREATE INDEX idx_property_images_property ON property_images(property_id);

CREATE INDEX idx_property_documents_property ON property_documents(property_id);
CREATE INDEX idx_property_documents_verified ON property_documents(verified);

CREATE INDEX idx_verification_requests_status ON verification_requests(status);
CREATE INDEX idx_verification_requests_entity ON verification_requests(entity_type, entity_id);

CREATE INDEX idx_admin_audit_logs_admin ON admin_audit_logs(admin_id, created_at);
CREATE INDEX idx_admin_audit_logs_action ON admin_audit_logs(action_type, entity_type);

CREATE INDEX idx_arrangements_property ON arrangements(property_id);
CREATE INDEX idx_arrangements_sitter ON arrangements(sitter_id);
CREATE INDEX idx_arrangements_homeowner ON arrangements(homeowner_id);
CREATE INDEX idx_arrangements_dates ON arrangements(start_date, end_date);
CREATE INDEX idx_arrangements_status ON arrangements(status);

CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_arrangement ON reviews(arrangement_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX idx_messages_arrangement ON messages(arrangement_id);
CREATE INDEX idx_messages_unread ON messages(receiver_id, is_read) WHERE NOT is_read;

CREATE INDEX idx_saved_properties_user ON saved_properties(user_id);
CREATE INDEX idx_saved_properties_property ON saved_properties(property_id);

CREATE INDEX idx_favorite_sitters_user ON favorite_sitters(user_id);
CREATE INDEX idx_favorite_sitters_sitter ON favorite_sitters(sitter_id);

CREATE INDEX idx_sitter_skills_sitter ON sitter_skills(sitter_id);
CREATE INDEX idx_sitter_languages_sitter ON sitter_languages(sitter_id);
CREATE INDEX idx_sitter_experience_sitter ON sitter_experience(sitter_id);

CREATE INDEX idx_sitter_discovery_sitter ON sitter_discovery(sitter_id);
CREATE INDEX idx_sitter_discovery_status ON sitter_discovery(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sitters_updated_at BEFORE UPDATE ON sitters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_requests_updated_at BEFORE UPDATE ON verification_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_arrangements_updated_at BEFORE UPDATE ON arrangements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sitter_discovery_updated_at BEFORE UPDATE ON sitter_discovery
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: Admin123!)
-- Note: You'll need to generate a proper bcrypt hash for 'Admin123!'
INSERT INTO users (id, email, password_hash, name, role, verified, verification_status) VALUES 
('11111111-1111-1111-1111-111111111111', 'admin@howsitter.com', '$2b$10$YourHashedPasswordHere', 'System Admin', 'admin', TRUE, 'approved');

-- Insert sample sitter for testing
INSERT INTO users (id, email, password_hash, name, role, phone, whatsapp, location, city, country, bio, verified, verification_status) VALUES 
('22222222-2222-2222-2222-222222222222', 'sitter@example.com', '$2b$10$YourHashedPasswordHere', 'John Sitter', 'sitter', '+1234567890', '+1234567890', 'New York, USA', 'New York', 'USA', 'Experienced house sitter with 5+ years of experience', TRUE, 'approved');

INSERT INTO sitters (id, user_id, rating, total_reviews, experience_years, response_rate, response_time, total_sits, is_available) VALUES 
('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 4.8, 12, 5, 98, 2, 15, TRUE);

INSERT INTO sitter_skills (sitter_id, skill) VALUES 
('33333333-3333-3333-3333-333333333333', 'Pet Care'),
('33333333-3333-3333-3333-333333333333', 'Plant Care'),
('33333333-3333-3333-3333-333333333333', 'Home Maintenance');

INSERT INTO sitter_languages (sitter_id, language, proficiency) VALUES 
('33333333-3333-3333-3333-333333333333', 'English', 'native'),
('33333333-3333-3333-3333-333333333333', 'Spanish', 'fluent');

-- Insert sample property for testing
INSERT INTO properties (id, homeowner_id, title, description, type, bedrooms, bathrooms, location, city, country, price_per_month, status, verification_status) VALUES 
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Beautiful Beach House', 'Amazing beachfront property with ocean view', 'house', 3, 2, 'Miami Beach', 'Miami', 'USA', 2500.00, 'available', 'approved');

INSERT INTO property_amenities (property_id, amenity) VALUES 
('44444444-4444-4444-4444-444444444444', 'WiFi'),
('44444444-4444-4444-4444-444444444444', 'Pool'),
('44444444-4444-4444-4444-444444444444', 'Parking');

INSERT INTO property_images (property_id, image_url, is_primary) VALUES 
('44444444-4444-4444-4444-444444444444', 'https://example.com/image1.jpg', TRUE),
('44444444-4444-4444-4444-444444444444', 'https://example.com/image2.jpg', FALSE);