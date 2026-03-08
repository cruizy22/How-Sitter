// backend/services/listingService.js
import axios from 'axios';

class ListingService {
  constructor() {
    // For now, we'll use mock data since you don't have API keys yet
    // When you get RapidAPI keys, uncomment the real implementation
  }

  // Parse URL to extract listing ID and platform
  parseUrl(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace('www.', '');
      
      // Airbnb patterns
      if (hostname.includes('airbnb')) {
        const patterns = [
          /\/rooms\/(\d+)/,
          /\/listing[s]?\/(\d+)/,
          /\/experiences\/(\d+)/,
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match && match[1]) {
            return {
              platform: 'airbnb',
              listingId: match[1],
              url: url
            };
          }
        }
      }
      
      // Booking.com patterns
      if (hostname.includes('booking')) {
        const patterns = [
          /\/hotel\/([a-z-]+)/,
          /property\/([a-z-]+)/,
          /\.([a-z-]+)\.html/
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match && match[1]) {
            return {
              platform: 'booking',
              listingId: match[1],
              url: url
            };
          }
        }
      }
      
      // If no platform matched, try to extract any ID
      const idMatch = url.match(/\/(\d+)(?:\?|$|\/)/);
      if (idMatch) {
        return {
          platform: 'unknown',
          listingId: idMatch[1],
          url: url
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing URL:', error);
      return null;
    }
  }

  // Generate realistic mock data based on listing ID
  generateMockData(parsedUrl) {
    const { listingId, platform } = parsedUrl;
    
    // Use listing ID to generate consistent mock data
    const hash = listingId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const cities = [
      { city: 'New York', country: 'USA', types: ['apartment', 'condo'] },
      { city: 'Los Angeles', country: 'USA', types: ['house', 'villa'] },
      { city: 'Miami', country: 'USA', types: ['apartment', 'villa'] },
      { city: 'London', country: 'UK', types: ['apartment', 'townhouse'] },
      { city: 'Paris', country: 'France', types: ['apartment'] },
      { city: 'Barcelona', country: 'Spain', types: ['apartment'] },
      { city: 'Rome', country: 'Italy', types: ['apartment'] },
      { city: 'Tokyo', country: 'Japan', types: ['apartment'] },
      { city: 'Sydney', country: 'Australia', types: ['house'] },
      { city: 'Toronto', country: 'Canada', types: ['apartment'] },
      { city: 'Dubai', country: 'UAE', types: ['villa'] },
      { city: 'Singapore', country: 'Singapore', types: ['apartment'] },
      { city: 'Berlin', country: 'Germany', types: ['apartment'] },
      { city: 'Amsterdam', country: 'Netherlands', types: ['apartment'] },
      { city: 'Bangkok', country: 'Thailand', types: ['apartment'] },
      { city: 'Bali', country: 'Indonesia', types: ['villa'] },
      { city: 'Cape Town', country: 'South Africa', types: ['house'] },
      { city: 'Rio de Janeiro', country: 'Brazil', types: ['apartment'] },
      { city: 'Mexico City', country: 'Mexico', types: ['apartment'] },
      { city: 'Istanbul', country: 'Turkey', types: ['apartment'] }
    ];
    
    const locationIndex = hash % cities.length;
    const location = cities[locationIndex];
    
    const availableTypes = location.types;
    const typeIndex = hash % availableTypes.length;
    const propertyType = availableTypes[typeIndex];
    
    const bedrooms = 1 + (hash % 5); // 1-5 bedrooms
    const bathrooms = Math.max(1, Math.floor(bedrooms * 0.7)); // 1-4 bathrooms
    const squareFeet = 400 + (hash % 2100); // 400-2500 sq ft
    
    // Generate price based on location and bedrooms
    const basePrice = {
      'USA': 2500,
      'UK': 2200,
      'France': 1800,
      'Spain': 1500,
      'Italy': 1400,
      'Japan': 1800,
      'Australia': 2000,
      'Canada': 1900,
      'UAE': 2800,
      'Singapore': 2500,
      'Germany': 1700,
      'Netherlands': 1600,
      'Thailand': 900,
      'Indonesia': 800,
      'South Africa': 1000,
      'Brazil': 1100,
      'Mexico': 1000,
      'Turkey': 900
    }[location.country] || 1500;
    
    const pricePerMonth = basePrice + (bedrooms * 200) + (hash % 500);
    
    // Generate title
    const adjectives = ['Beautiful', 'Cozy', 'Luxury', 'Spacious', 'Modern', 'Charming', 'Stunning', 'Elegant', 'Bright', 'Renovated'];
    const adjIndex = hash % adjectives.length;
    const title = `${adjectives[adjIndex]} ${bedrooms}-Bedroom ${propertyType} in ${location.city}`;
    
    // Generate description
    const descriptions = [
      `This beautiful ${propertyType} offers stunning views and modern amenities. Perfect for house sitting with minimum 1-month stays.`,
      `Enjoy your stay in this cozy ${propertyType} located in the heart of ${location.city}. Fully furnished and ready for you.`,
      `Experience luxury living in this spacious ${propertyType} with all amenities included. Great location near restaurants and shops.`,
      `Perfect for families or professionals, this ${propertyType} features ${bedrooms} bedrooms and a fully equipped kitchen.`,
      `Recently renovated ${propertyType} with high-end finishes and smart home features. Quiet neighborhood with easy access to public transport.`
    ];
    const descIndex = hash % descriptions.length;
    const description = descriptions[descIndex];
    
    // Generate amenities based on property type and hash
    const allAmenities = [
      'wifi', 'parking', 'pool', 'garden', 'ac', 'gym', 'kitchen', 'laundry',
      'tv', 'workspace', 'pets', 'smoking', 'elevator', 'fireplace', 'beach', 'mountain'
    ];
    
    const numAmenities = 5 + (hash % 6); // 5-10 amenities
    const shuffled = [...allAmenities].sort(() => 0.5 - Math.random());
    const amenities = shuffled.slice(0, numAmenities);
    
    return {
      title,
      description,
      type: propertyType,
      bedrooms,
      bathrooms,
      location: `${Math.floor(100 + (hash % 900))} ${['Main St', 'Broadway', 'Park Ave', 'Ocean Dr', 'Mountain Rd'][hash % 5]}`,
      city: location.city,
      country: location.country,
      price_per_month: pricePerMonth,
      security_deposit: Math.round(pricePerMonth * 0.2),
      amenities,
      square_feet: squareFeet,
      source_platform: platform,
      source_url: parsedUrl.url
    };
  }

  // Main method to fetch listing data
  async fetchListingData(url) {
    try {
      const parsed = this.parseUrl(url);
      
      if (!parsed) {
        throw new Error('Could not parse URL. Please check the format.');
      }

      console.log(`📋 Parsed URL:`, parsed);

      // For now, generate mock data
      // When you have API keys, replace this with real API calls
      const mockData = this.generateMockData(parsed);
      
      return {
        success: true,
        data: mockData
      };
      
    } catch (error) {
      console.error('Listing fetch error:', error);
      throw error;
    }
  }
}

export default new ListingService();