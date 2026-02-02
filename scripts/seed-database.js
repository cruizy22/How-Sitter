// scripts/seed-database.js
import mysql from 'mysql2/promise';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const amenities = [
  'WiFi', 'AC', 'Heating', 'Kitchen', 'TV', 'Washer', 'Dryer',
  'Parking', 'Pool', 'Gym', 'Garden', 'Balcony', 'BBQ', 'Jacuzzi'
];

const countries = ['Singapore', 'USA', 'UK', 'Australia', 'Canada', 'Japan', 'Germany'];

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('TRUNCATE TABLE users');
    await pool.query('TRUNCATE TABLE sitters');
    await pool.query('TRUNCATE TABLE properties');
    await pool.query('TRUNCATE TABLE property_amenities');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    // Create 20 homeowners
    for (let i = 0; i < 20; i++) {
      const userId = faker.string.uuid();
      await pool.query(
        `INSERT INTO users (id, email, password_hash, name, role, phone, country, bio, verified) 
         VALUES (?, ?, ?, ?, 'homeowner', ?, ?, ?, TRUE)`,
        [
          userId,
          faker.internet.email(),
          '$2b$10$...', // Hashed password
          faker.person.fullName(),
          faker.phone.number(),
          faker.helpers.arrayElement(countries),
          faker.lorem.paragraph()
        ]
      );

      // Create property for each homeowner
      const propertyId = faker.string.uuid();
      await pool.query(
        `INSERT INTO properties (
          id, homeowner_id, title, description, type, bedrooms, bathrooms, 
          location, city, country, price_per_month, security_deposit,
          status, availability_start, availability_end
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?, ?)`,
        [
          propertyId,
          userId,
          faker.lorem.words(3),
          faker.lorem.paragraphs(2),
          faker.helpers.arrayElement(['apartment', 'house', 'villa', 'condo']),
          faker.number.int({ min: 1, max: 5 }),
          faker.number.int({ min: 1, max: 4 }),
          faker.location.streetAddress(),
          faker.location.city(),
          faker.helpers.arrayElement(countries),
          faker.number.float({ min: 800, max: 5000, precision: 0.01 }),
          faker.number.float({ min: 500, max: 2000, precision: 0.01 }),
          faker.date.future(),
          faker.date.future()
        ]
      );

      // Add amenities
      const propertyAmenities = faker.helpers.arrayElements(amenities, 5);
      for (const amenity of propertyAmenities) {
        await pool.query(
          'INSERT INTO property_amenities (property_id, amenity) VALUES (?, ?)',
          [propertyId, amenity]
        );
      }

      // Add property images
      for (let j = 0; j < 3; j++) {
        await pool.query(
          'INSERT INTO property_images (property_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
          [propertyId, `https://picsum.photos/seed/${propertyId}/${j}/800/600`, j === 0, j]
        );
      }
    }

    // Create 15 sitters
    for (let i = 0; i < 15; i++) {
      const userId = faker.string.uuid();
      await pool.query(
        `INSERT INTO users (id, email, password_hash, name, role, phone, country, bio, verified) 
         VALUES (?, ?, ?, ?, 'sitter', ?, ?, ?, TRUE)`,
        [
          userId,
          faker.internet.email(),
          '$2b$10$...',
          faker.person.fullName(),
          faker.phone.number(),
          faker.helpers.arrayElement(countries),
          faker.lorem.paragraph()
        ]
      );

      await pool.query(
        `INSERT INTO sitters (
          user_id, rating, total_reviews, experience_years, credentials, languages, is_available
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          faker.number.float({ min: 3.5, max: 5, precision: 0.1 }),
          faker.number.int({ min: 0, max: 200 }),
          faker.number.int({ min: 0, max: 10 }),
          JSON.stringify(faker.helpers.arrayElements(['First Aid Certified', 'Pet Care', 'Gardening', 'Cooking', 'Cleaning'], 3)),
          JSON.stringify(faker.helpers.arrayElements(['English', 'Spanish', 'French', 'German', 'Japanese'], 2)),
          faker.datatype.boolean()
        ]
      );
    }

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase();