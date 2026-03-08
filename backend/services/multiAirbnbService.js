// backend/services/multiAirbnbService.js
import axios from 'axios';

class MultiAirbnbService {
  constructor() {
    this.rapidApiKey = process.env.RAPIDAPI_KEY;
    
    // Comprehensive list of Airbnb API providers from RapidAPI
    this.apiProviders = [
      // === HIGH PRIORITY (Most Likely to Work) ===
      {
        name: 'Airbnb 19',
        host: 'airbnb19.p.rapidapi.com',
        endpoints: [
          { path: '/api/v2/getPropertyDetails', params: (id) => ({ propertyId: id }) },
          { path: '/api/v2/searchPropertyByPlaceId', params: () => ({ placeId: 'ChIJ7cv00DwsDogRAMDACa2m4K8' }) }
        ],
        priority: 1
      },
      {
        name: 'Airbnb 13',
        host: 'airbnb13.p.rapidapi.com',
        endpoints: [
          { path: '/get-property', params: (id) => ({ id }) },
          { path: '/get-listing', params: (id) => ({ id }) },
          { path: '/search-location', params: () => ({ location: 'any', checkin: '2024-01-01', checkout: '2024-01-07' }) }
        ],
        priority: 2
      },
      {
        name: 'Airbnb Scraper',
        host: 'airbnb-scraper.p.rapidapi.com',
        endpoints: [
          { path: '/listings/detail', params: (id) => ({ listingId: id }) },
          { path: '/listings/search', params: () => ({ location: 'any' }) }
        ],
        priority: 3
      },
      {
        name: 'Airbnb API (Apidojo)',
        host: 'airbnb-api.p.rapidapi.com',
        endpoints: [
          { path: '/get-listing', params: (id) => ({ id }) },
          { path: '/get-property', params: (id) => ({ id }) }
        ],
        priority: 4
      },
      
      // === MEDIUM PRIORITY ===
      {
        name: 'Airbnb Data (Neobi)',
        host: 'airbnb-data.p.rapidapi.com',
        endpoints: [
          { path: '/get-property', params: (id) => ({ propertyId: id }) }
        ],
        priority: 5
      },
      {
        name: 'Airbnb Reviews',
        host: 'airbnb-reviews.p.rapidapi.com',
        endpoints: [
          { path: '/reviews/get', params: (id) => ({ listingId: id }) }
        ],
        priority: 6
      },
      {
        name: 'Airbnb Search',
        host: 'airbnb-search.p.rapidapi.com',
        endpoints: [
          { path: '/get-property', params: (id) => ({ id }) }
        ],
        priority: 7
      },
      {
        name: 'Airbnb listings (InsideBnB)',
        host: 'airbnb-listings.p.rapidapi.com',
        endpoints: [
          { path: '/listings/detail', params: (id) => ({ id }) }
        ],
        priority: 8
      },
      
      // === LOW PRIORITY (Backup) ===
      {
        name: 'Airbnb (DataCrawler)',
        host: 'airbnb-com.p.rapidapi.com',
        endpoints: [
          { path: '/listings/detail', params: (id) => ({ id }) }
        ],
        priority: 9
      },
      {
        name: 'Airbnb (3B Data)',
        host: 'airbnb-com.p.rapidapi.com',
        endpoints: [
          { path: '/get-property', params: (id) => ({ id }) }
        ],
        priority: 10
      },
      {
        name: 'Airbnb Hub',
        host: 'airbnb-hub.p.rapidapi.com',
        endpoints: [
          { path: '/get-property', params: (id) => ({ id }) }
        ],
        priority: 11
      },
      {
        name: 'Airbnb (Vibe)',
        host: 'airbnb-data.p.rapidapi.com',
        endpoints: [
          { path: '/get-property', params: (id) => ({ id }) }
        ],
        priority: 12
      },
      {
        name: 'Airbnb (Nayan Arora)',
        host: 'airbnb-api.p.rapidapi.com',
        endpoints: [
          { path: '/get-property', params: (id) => ({ id }) }
        ],
        priority: 13
      },
      {
        name: 'Airbnb (Glavier)',
        host: 'airbnb-api.p.rapidapi.com',
        endpoints: [
          { path: '/get-property', params: (id) => ({ id }) }
        ],
        priority: 14
      },
      {
        name: 'Airbnb⚡Now',
        host: 'airbnb-now.p.rapidapi.com',
        endpoints: [
          { path: '/get-property', params: (id) => ({ id }) }
        ],
        priority: 15
      },
      {
        name: 'Airbnb (Jamshaid Arif)',
        host: 'airbnb-api.p.rapidapi.com',
        endpoints: [
          { path: '/get-property', params: (id) => ({ id }) }
        ],
        priority: 16
      }
    ];

    // Sort by priority
    this.apiProviders.sort((a, b) => a.priority - b.priority);

    // Track usage statistics
    this.usageStats = {};
    this.apiProviders.forEach(p => {
      this.usageStats[p.name] = {
        attempts: 0,
        successes: 0,
        failures: 0,
        lastUsed: null,
        lastError: null
      };
    });
  }

  parseUrl(url) {
    try {
      const urlWithoutParams = url.split('?')[0];
      
      const patterns = [
        /\/rooms\/(\d+)/,
        /\/listing[s]?\/(\d+)/,
        /\/(\d+)(?:\/|$)/
      ];
      
      for (const pattern of patterns) {
        const match = urlWithoutParams.match(pattern);
        if (match && match[1]) {
          const id = match[1];
          if (/^\d+$/.test(id)) {
            return {
              platform: 'airbnb',
              listingId: id,
              url: url
            };
          }
        }
      }
      
      throw new Error('Could not extract valid Airbnb listing ID');
    } catch (error) {
      throw new Error(`Invalid Airbnb URL: ${error.message}`);
    }
  }

  async tryProvider(provider, listingId) {
    for (const endpoint of provider.endpoints) {
      try {
        this.usageStats[provider.name].attempts++;
        this.usageStats[provider.name].lastUsed = new Date();

        console.log(`🔄 [Priority ${provider.priority}] Trying ${provider.name} - ${endpoint.path}...`);
        
        const options = {
          method: 'GET',
          url: `https://${provider.host}${endpoint.path}`,
          params: typeof endpoint.params === 'function' ? endpoint.params(listingId) : endpoint.params,
          headers: {
            'X-RapidAPI-Key': this.rapidApiKey,
            'X-RapidAPI-Host': provider.host
          },
          timeout: 8000
        };

        const response = await axios.request(options);
        
        if (response.data && !response.data.error) {
          this.usageStats[provider.name].successes++;
          console.log(`✅ SUCCESS with ${provider.name}`);
          return {
            success: true,
            data: response.data,
            provider: provider.name
          };
        }
      } catch (error) {
        this.usageStats[provider.name].failures++;
        this.usageStats[provider.name].lastError = error.message;
        
        if (error.response) {
          // 429 means rate limited - skip this provider entirely
          if (error.response.status === 429) {
            console.log(`⚠️ ${provider.name} rate limited, skipping...`);
            break;
          }
          console.log(`❌ ${provider.name} failed: ${error.response.status}`);
        } else {
          console.log(`❌ ${provider.name} error: ${error.message}`);
        }
      }
    }
    return null;
  }

  async fetchAirbnbData(listingId) {
    try {
      if (!this.rapidApiKey) {
        throw new Error('RapidAPI key not configured');
      }

      console.log(`\n🔍 Fetching Airbnb data for listing: ${listingId}`);
      console.log(`🔄 Will try ${this.apiProviders.length} different APIs in priority order...\n`);

      // Try each provider in priority order
      for (const provider of this.apiProviders) {
        const result = await this.tryProvider(provider, listingId);
        
        if (result && result.success) {
          console.log(`\n✅ Successfully got data from ${result.provider} (Priority: ${provider.priority})`);
          
          // Map the response to our standard format
          const mappedData = this.mapResponseToProperty(result.data, listingId);
          
          return {
            success: true,
            data: mappedData,
            provider: result.provider
          };
        }
        
        // Small delay between providers to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // All APIs failed, use enhanced mock data
      console.log('\n❌ All APIs failed, using enhanced mock data');
      console.log('📊 Usage stats:', this.getUsageSummary());
      
      return {
        success: true,
        data: this.getEnhancedMockData(listingId),
        provider: 'mock'
      };

    } catch (error) {
      console.error('Airbnb API error:', error.message);
      return {
        success: true,
        data: this.getEnhancedMockData(listingId),
        provider: 'mock'
      };
    }
  }

  mapResponseToProperty(data, listingId) {
    // Handle different response structures
    const property = data.data || data.listing || data.property || data;
    
    // Extract title
    const title = property.name || 
                  property.title || 
                  property.listingName || 
                  `Property in ${listingId}`;

    // Extract description
    let description = property.description || 
                      property.summary || 
                      property.about || 
                      'Beautiful property available for house sitting';

    // Extract price
    let pricePerMonth = 2500;
    if (property.price) {
      if (property.price.monthly) {
        pricePerMonth = property.price.monthly;
      } else if (property.price.nightly) {
        pricePerMonth = Math.round(property.price.nightly * 30 * 0.9);
      } else if (property.price.perNight) {
        pricePerMonth = Math.round(property.price.perNight * 30 * 0.9);
      } else if (typeof property.price === 'number') {
        pricePerMonth = Math.round(property.price * 30 * 0.9);
      }
    } else if (property.pricing) {
      if (property.pricing.monthly) {
        pricePerMonth = property.pricing.monthly;
      } else if (property.pricing.nightly) {
        pricePerMonth = Math.round(property.pricing.nightly * 30 * 0.9);
      }
    }

    // Extract location
    let city = 'Unknown';
    let country = 'Unknown';
    let address = '';

    if (property.location) {
      city = property.location.city || 
             property.location.addressLocality || 
             property.location.locality || 
             city;
      country = property.location.country || 
                property.location.addressCountry || 
                country;
      address = property.location.address || 
                property.location.street || 
                '';
    }

    // Try to extract from title if location missing
    if (city === 'Unknown' && title) {
      const cityMatch = title.match(/in\s+([A-Za-z\s]+?)(?:\s*·|,|$)/i);
      if (cityMatch) {
        city = cityMatch[1].trim();
      }
    }

    // Extract rooms
    const bedrooms = property.bedrooms || 
                     property.bedrooms_count || 
                     property.bedroomCount || 
                     1;
    
    const bathrooms = property.bathrooms || 
                      property.bathrooms_count || 
                      property.bathroomCount || 
                      1;

    // Extract property type
    const propertyType = property.propertyType || 
                         property.roomType || 
                         property.type || 
                         'apartment';
    const mappedType = this.mapPropertyType(propertyType);

    // Extract amenities
    let amenityList = [];
    if (property.amenities && Array.isArray(property.amenities)) {
      amenityList = property.amenities.map(a => 
        typeof a === 'string' ? a : a.name || a.title || ''
      ).filter(Boolean);
    } else if (property.previewAmenities && Array.isArray(property.previewAmenities)) {
      amenityList = property.previewAmenities;
    }
    const amenities = this.extractAmenities(amenityList);

    // Extract images
    let images = [];
    if (property.images && Array.isArray(property.images)) {
      images = property.images.map((img, index) => ({
        url: img.url || img.imageUrl || img,
        caption: img.caption || '',
        isPrimary: index === 0
      }));
    } else if (property.photos && Array.isArray(property.photos)) {
      images = property.photos.map((photo, index) => ({
        url: photo.url || photo.imageUrl || photo,
        caption: photo.caption || '',
        isPrimary: index === 0
      }));
    } else if (property.imageUrl) {
      images = [{
        url: property.imageUrl,
        caption: 'Main image',
        isPrimary: true
      }];
    }

    // Extract host info
    const hostName = property.host?.name || 
                     property.hostName || 
                     'Verified Host';

    return {
      title: title,
      description: description,
      type: mappedType,
      bedrooms: parseInt(bedrooms) || 1,
      bathrooms: parseFloat(bathrooms) || 1,
      location: address || `${city}, ${country}`,
      city: city,
      country: country,
      price_per_month: pricePerMonth,
      security_deposit: Math.round(pricePerMonth * 0.2),
      amenities: amenities,
      square_feet: null,
      images: images.length > 0 ? images : this.getDefaultImages(),
      primary_image: images.find(img => img.isPrimary)?.url || images[0]?.url || this.getDefaultImages()[0].url,
      host_name: hostName,
      host_avatar: property.host?.pictureUrl || null,
      property_url: `https://www.airbnb.com/rooms/${listingId}`,
      source_platform: 'airbnb'
    };
  }

  getDefaultImages() {
    return [
      { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', caption: 'Living room', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', caption: 'Bedroom', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00', caption: 'Kitchen', isPrimary: false }
    ];
  }

  getEnhancedMockData(listingId) {
    const hash = listingId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const cities = [
      { city: 'Mombasa', country: 'Kenya', priceBase: 800 },
      { city: 'Nairobi', country: 'Kenya', priceBase: 700 },
      { city: 'Kisumu', country: 'Kenya', priceBase: 500 },
      { city: 'Diani', country: 'Kenya', priceBase: 600 },
      { city: 'Malindi', country: 'Kenya', priceBase: 550 },
      { city: 'Watamu', country: 'Kenya', priceBase: 580 },
      { city: 'Naivasha', country: 'Kenya', priceBase: 450 },
      { city: 'Nakuru', country: 'Kenya', priceBase: 400 },
      { city: 'New York', country: 'USA', priceBase: 3000 },
      { city: 'London', country: 'UK', priceBase: 2800 },
      { city: 'Paris', country: 'France', priceBase: 2500 },
      { city: 'Tokyo', country: 'Japan', priceBase: 2200 },
      { city: 'Sydney', country: 'Australia', priceBase: 2600 }
    ];
    
    const cityIndex = hash % cities.length;
    const location = cities[cityIndex];
    const bedrooms = 1 + (hash % 5);
    const pricePerMonth = location.priceBase + (bedrooms * 200);

    const allAmenities = ['wifi', 'kitchen', 'tv', 'ac', 'parking', 'laundry', 'workspace', 'pool'];
    const numAmenities = 4 + (hash % 4);
    const shuffled = [...allAmenities].sort(() => 0.5 - Math.random());
    const amenities = shuffled.slice(0, numAmenities);

    return {
      title: `${bedrooms}-Bedroom Property in ${location.city}`,
      description: `Beautiful ${bedrooms}-bedroom property in ${location.city}, ${location.country}. Perfect for house sitting with all amenities included.`,
      type: bedrooms === 1 ? 'apartment' : 'house',
      bedrooms: bedrooms,
      bathrooms: bedrooms > 2 ? 2 : 1.5,
      location: `Central ${location.city}`,
      city: location.city,
      country: location.country,
      price_per_month: pricePerMonth,
      security_deposit: Math.round(pricePerMonth * 0.2),
      amenities: [...new Set(amenities)],
      square_feet: 500 + (bedrooms * 200),
      images: this.getDefaultImages(),
      primary_image: this.getDefaultImages()[0].url,
      host_name: 'Superhost',
      host_avatar: null,
      property_url: `https://www.airbnb.com/rooms/${listingId}`
    };
  }

  mapPropertyType(type) {
    const typeMap = {
      'apartment': 'apartment',
      'house': 'house',
      'villa': 'villa',
      'condo': 'condo',
      'townhouse': 'townhouse',
      'loft': 'apartment',
      'studio': 'apartment',
      'cabin': 'house',
      'cottage': 'house',
      'entire rental unit': 'apartment',
      'entire home/apt': 'house',
      'private room': 'apartment',
      'shared room': 'apartment'
    };
    
    const normalized = type?.toLowerCase() || 'apartment';
    return typeMap[normalized] || 'apartment';
  }

  extractAmenities(amenityNames) {
    if (!Array.isArray(amenityNames) || amenityNames.length === 0) {
      return ['wifi', 'kitchen', 'tv', 'ac'];
    }

    const amenityMap = {
      'wifi': ['wifi', 'internet', 'wireless', 'broadband'],
      'parking': ['parking', 'garage', 'driveway'],
      'pool': ['pool', 'swimming'],
      'gym': ['gym', 'fitness'],
      'kitchen': ['kitchen', 'cooking', 'stove', 'oven', 'microwave'],
      'laundry': ['laundry', 'washer', 'dryer'],
      'tv': ['tv', 'television'],
      'workspace': ['workspace', 'desk', 'office'],
      'beach': ['beach', 'ocean', 'sea'],
      'ac': ['air conditioning', 'ac', 'a/c'],
      'elevator': ['elevator', 'lift'],
      'garden': ['garden', 'yard', 'patio']
    };

    const selected = [];
    const text = amenityNames.join(' ').toLowerCase();

    for (const [key, keywords] of Object.entries(amenityMap)) {
      if (keywords.some(k => text.includes(k))) {
        selected.push(key);
      }
    }

    return selected.length ? [...new Set(selected)] : ['wifi', 'kitchen', 'tv', 'ac'];
  }

  async fetchListingData(url) {
    try {
      const parsed = this.parseUrl(url);
      console.log('📋 Parsed URL:', parsed);
      
      const result = await this.fetchAirbnbData(parsed.listingId);

      return {
        success: true,
        data: {
          ...result.data,
          source_provider: result.provider,
          source_url: parsed.url,
          original_listing_id: parsed.listingId
        }
      };
      
    } catch (error) {
      console.error('Listing fetch error:', error);
      
      // Fallback to mock data
      const mockData = this.getEnhancedMockData('123456');
      return {
        success: true,
        data: {
          ...mockData,
          source_provider: 'mock',
          source_url: url,
          original_listing_id: '123456'
        }
      };
    }
  }

  getUsageSummary() {
    return Object.entries(this.usageStats)
      .map(([name, stats]) => ({
        provider: name,
        attempts: stats.attempts,
        successes: stats.successes,
        failures: stats.failures,
        successRate: stats.attempts > 0 
          ? Math.round((stats.successes / stats.attempts) * 100) 
          : 0,
        lastUsed: stats.lastUsed,
        lastError: stats.lastError
      }))
      .filter(stat => stat.attempts > 0)
      .sort((a, b) => b.successRate - a.successRate);
  }

  resetUsage() {
    this.usageStats = {};
    this.apiProviders.forEach(p => {
      this.usageStats[p.name] = {
        attempts: 0,
        successes: 0,
        failures: 0,
        lastUsed: null,
        lastError: null
      };
    });
  }
}

export default new MultiAirbnbService();