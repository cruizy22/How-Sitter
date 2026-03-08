// backend/services/scrapingantService.js
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';

dotenv.config();

class ScrapingAntService {
  constructor() {
    this.apiKey = process.env.SCRAPINGANT_API_KEY;
    this.baseUrl = 'https://api.scrapingant.com/v2';
    
    // Debug: Check if API key is loaded
    console.log('🔧 ScrapingAnt Service Initialized');
    console.log(`🔑 API Key ${this.apiKey ? '✓ Loaded' : '✗ Missing'}`);
  }

  parseUrl(url) {
    try {
      const urlWithoutParams = url.split('?')[0];
      const match = urlWithoutParams.match(/\/rooms\/(\d+)/);
      if (match && match[1]) {
        return {
          platform: 'airbnb',
          listingId: match[1],
          url: url
        };
      }
      throw new Error('Invalid Airbnb URL');
    } catch (error) {
      throw new Error(`Invalid URL: ${error.message}`);
    }
  }

  async fetchAirbnbData(listingId) {
    try {
      if (!this.apiKey) {
        throw new Error('ScrapingAnt API key is not configured');
      }

      console.log(`\n🔍 Scraping Airbnb listing: ${listingId}`);
      console.log(`⏳ Using ScrapingAnt (Free Tier: 10,000 requests/month)`);
      
      const targetUrl = `https://www.airbnb.com/rooms/${listingId}`;
      
      // CORRECT FORMAT: x-api-key goes in the HEADER, not params
      console.log('📡 Sending request to ScrapingAnt...');
      
      const response = await axios({
        method: 'GET',
        url: `${this.baseUrl}/general`,
        params: {
          url: targetUrl,
          browser: true,
          wait_for_selector: 'h1',
          proxy_country: 'US',
        },
        headers: {
          'x-api-key': this.apiKey,  // ← KEY MUST BE IN HEADER
        },
        timeout: 30000
      });

      if (!response.data || !response.data.content) {
        throw new Error('No content received from ScrapingAnt');
      }

      console.log('✅ Successfully fetched page from ScrapingAnt');
      console.log(`📊 Response size: ${response.data.content.length} bytes`);
      
      // Check if we got a proper HTML response
      if (response.data.content.includes('<title>')) {
        console.log('📄 Valid HTML received with title tag');
      } else {
        console.log('⚠️ Response may not be valid HTML');
      }
      
      // Parse the HTML
      const propertyData = this.parseAirbnbHtml(response.data.content, listingId);
      
      console.log('✅ Successfully extracted property data');
      return {
        success: true,
        data: propertyData
      };

    } catch (error) {
      console.error('❌ ScrapingAnt error:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response:', error.response.data);
        console.error('Headers:', error.response.headers);
      }
      return {
        success: false,
        error: error.message,
        details: error.response?.data
      };
    }
  }

  parseAirbnbHtml(html, listingId) {
    const $ = cheerio.load(html);
    const pageText = $('body').text();
    
    console.log('📄 Parsing HTML content...');
    console.log(`📏 HTML length: ${html.length} chars`);

    // ===== EXTRACT TITLE =====
    let title = $('h1').first().text().trim() || 
                $('meta[property="og:title"]').attr('content') ||
                `Airbnb Property ${listingId}`;
    console.log(`   Title: ${title.substring(0, 50)}...`);

    // ===== EXTRACT DESCRIPTION =====
    let description = $('meta[name="description"]').attr('content') ||
                      $('meta[property="og:description"]').attr('content') ||
                      'Beautiful property available for house sitting';

    // ===== EXTRACT PRICE =====
    let pricePerNight = 100;
    // Try multiple price patterns
    const pricePatterns = [
      /\$([0-9,]+)\s*(?:per night|night)/i,
      /\$([0-9,]+)\s*\/\s*night/i,
      /\$([0-9,]+)\s*total/i,
      /([0-9,]+)\s*KES\s*(?:per night|night)/i,
      /price-per-night["']:\s*"?\$?([0-9,]+)/i,
      /nightlyPrice["']:\s*([0-9,]+)/i
    ];
    
    for (const pattern of pricePatterns) {
      const match = pageText.match(pattern);
      if (match) {
        pricePerNight = parseInt(match[1].replace(',', ''));
        // Convert KES to USD if needed
        if (pattern.toString().includes('KES')) {
          pricePerNight = Math.round(pricePerNight / 130);
        }
        break;
      }
    }
    
    // If price seems too high, it might be total for multiple nights
    if (pricePerNight > 1000) {
      pricePerNight = Math.round(pricePerNight / 2.5);
    }
    
    const monthlyPrice = Math.round(pricePerNight * 30 * 0.9);
    console.log(`   Price: $${pricePerNight}/night → $${monthlyPrice}/month`);

    // ===== EXTRACT BEDROOMS =====
    let bedrooms = 1;
    const bedroomMatch = pageText.match(/(\d+)\s*(?:bedroom|bed)/i);
    if (bedroomMatch) bedrooms = parseInt(bedroomMatch[1]);
    console.log(`   Bedrooms: ${bedrooms}`);

    // ===== EXTRACT BATHROOMS =====
    let bathrooms = 1;
    const bathroomMatch = pageText.match(/(\d+(?:\.\d+)?)\s*(?:bathroom|bath)/i);
    if (bathroomMatch) bathrooms = parseFloat(bathroomMatch[1]);
    console.log(`   Bathrooms: ${bathrooms}`);

    // ===== EXTRACT LOCATION =====
    let location = $('[data-testid="location-root"]').text().trim() ||
                   $('._b14dlit').text().trim() ||
                   $('meta[property="og:locality"]').attr('content') ||
                   '';
    
    let city = 'Unknown';
    let country = 'Unknown';
    if (location) {
      const parts = location.split(',');
      if (parts.length >= 2) {
        city = parts[0].trim();
        country = parts[parts.length - 1].trim();
      } else {
        city = location.trim();
      }
    }
    
    // Try to extract from title if location missing
    if (city === 'Unknown' && title) {
      const cityMatch = title.match(/in\s+([A-Za-z\s]+?)(?:\s*·|,|$)/i);
      if (cityMatch) {
        city = cityMatch[1].trim();
        if (city.toLowerCase().includes('mombasa')) country = 'Kenya';
        else if (city.toLowerCase().includes('nairobi')) country = 'Kenya';
        else if (city.toLowerCase().includes('kisumu')) country = 'Kenya';
        else if (city.toLowerCase().includes('diani')) country = 'Kenya';
      }
    }
    console.log(`   Location: ${city}, ${country}`);

    // ===== EXTRACT IMAGES =====
    const images = [];
    
    // Try meta image first
    const metaImage = $('meta[property="og:image"]').attr('content');
    if (metaImage && metaImage.startsWith('http')) {
      images.push({
        url: metaImage,
        caption: 'Main image',
        isPrimary: true
      });
    }
    
    // Then try image elements
    $('img[src*="airbnb"], img[data-original*="airbnb"], img[src*="muscache"]').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-original');
      if (src && src.startsWith('http') && !images.some(img => img.url === src)) {
        images.push({
          url: src,
          caption: `Image ${images.length + 1}`,
          isPrimary: images.length === 0 && !metaImage
        });
      }
    });
    console.log(`   Images found: ${images.length}`);

    // ===== EXTRACT AMENITIES =====
    const amenities = [];
    $('[data-section-id="AMENITIES_DEFAULT"] li, ._1jpj8mc, ._1byskwn, .f1nhqas0').each((i, el) => {
      const amenity = $(el).text().trim();
      if (amenity && !amenities.includes(amenity) && amenity.length < 50) {
        amenities.push(amenity);
      }
    });

    // Map amenities to your format
    const mappedAmenities = this.mapAmenities(amenities);
    console.log(`   Amenities mapped: ${mappedAmenities.length}`);

    // ===== EXTRACT HOST NAME =====
    let hostName = $('[data-testid="host-name"]').first().text().trim() ||
                   $('._1e4l3k2').first().text().trim() ||
                   $('.f19phm7j').first().text().trim() ||
                   'Host';

    return {
      title,
      description,
      type: this.detectPropertyType(title),
      bedrooms,
      bathrooms,
      location: location || `${city}, ${country}`,
      city,
      country,
      price_per_month: monthlyPrice,
      security_deposit: Math.round(monthlyPrice * 0.2),
      amenities: mappedAmenities,
      images: images.slice(0, 8),
      primary_image: images[0]?.url || null,
      host_name: hostName,
      property_url: `https://www.airbnb.com/rooms/${listingId}`
    };
  }

  mapAmenities(amenityList) {
    const amenityMap = {
      'wifi': ['wifi', 'internet', 'wireless', 'broadband'],
      'parking': ['parking', 'garage', 'driveway'],
      'pool': ['pool', 'swimming', 'swim'],
      'gym': ['gym', 'fitness', 'workout'],
      'kitchen': ['kitchen', 'cooking', 'stove', 'oven', 'microwave', 'refrigerator'],
      'laundry': ['laundry', 'washer', 'dryer'],
      'tv': ['tv', 'television', 'cable'],
      'workspace': ['workspace', 'desk', 'office'],
      'ac': ['air conditioning', 'ac', 'a/c', 'cooling'],
      'elevator': ['elevator', 'lift'],
      'garden': ['garden', 'yard', 'patio', 'terrace'],
      'beach': ['beach', 'ocean', 'sea', 'waterfront'],
      'pets': ['pets', 'pet friendly', 'dogs'],
      'fireplace': ['fireplace', 'wood burning']
    };

    const selected = [];
    const text = amenityList.join(' ').toLowerCase();

    for (const [key, keywords] of Object.entries(amenityMap)) {
      if (keywords.some(k => text.includes(k))) {
        selected.push(key);
      }
    }

    return selected.length ? [...new Set(selected)] : ['wifi', 'kitchen', 'tv', 'ac'];
  }

  detectPropertyType(title) {
    const text = title.toLowerCase();
    if (text.includes('apartment')) return 'apartment';
    if (text.includes('house')) return 'house';
    if (text.includes('villa')) return 'villa';
    if (text.includes('condo')) return 'condo';
    if (text.includes('townhouse')) return 'townhouse';
    if (text.includes('studio')) return 'apartment';
    return 'apartment';
  }

  getMockData(listingId) {
    const hash = listingId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const cities = [
      { city: 'Mombasa', country: 'Kenya', priceBase: 800 },
      { city: 'Nairobi', country: 'Kenya', priceBase: 700 },
      { city: 'Diani', country: 'Kenya', priceBase: 600 },
      { city: 'Kisumu', country: 'Kenya', priceBase: 500 },
      { city: 'Malindi', country: 'Kenya', priceBase: 550 },
      { city: 'Watamu', country: 'Kenya', priceBase: 580 }
    ];
    
    const location = cities[hash % cities.length];
    const bedrooms = 1 + (hash % 4);
    const pricePerMonth = location.priceBase + (bedrooms * 200);

    return {
      title: `${bedrooms}-Bedroom Property in ${location.city}`,
      description: `Beautiful ${bedrooms}-bedroom property in ${location.city}, ${location.country}. Perfect for house sitting.`,
      type: bedrooms === 1 ? 'apartment' : 'house',
      bedrooms,
      bathrooms: bedrooms > 2 ? 2 : 1.5,
      location: `Central ${location.city}`,
      city: location.city,
      country: location.country,
      price_per_month: pricePerMonth,
      security_deposit: Math.round(pricePerMonth * 0.2),
      amenities: ['wifi', 'kitchen', 'tv', 'ac'],
      images: [],
      primary_image: null,
      host_name: 'Superhost'
    };
  }

  async fetchListingData(url) {
    try {
      const parsed = this.parseUrl(url);
      console.log('\n' + '='.repeat(60));
      console.log('📋 Parsed URL:', parsed);
      console.log('='.repeat(60));
      
      const result = await this.fetchAirbnbData(parsed.listingId);
      
      if (result.success) {
        return {
          success: true,
          data: {
            ...result.data,
            source_provider: 'scrapingant',
            source_url: parsed.url,
            original_listing_id: parsed.listingId
          }
        };
      }
      
      console.log('⚠️ ScrapingAnt failed, using mock data');
      return {
        success: true,
        data: {
          ...this.getMockData(parsed.listingId),
          source_provider: 'mock',
          source_url: parsed.url,
          original_listing_id: parsed.listingId
        }
      };
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      return {
        success: true,
        data: {
          ...this.getMockData('123456'),
          source_provider: 'mock',
          source_url: url,
          original_listing_id: '123456'
        }
      };
    }
  }
}

export default new ScrapingAntService();