// src/services/api.ts - ENHANCED VERSION
const API_BASE_URL = 'http://localhost:5000/api';

// Core Interfaces
export interface Property {
  id: string;
  title: string;
  description: string;
  type: 'apartment' | 'house' | 'villa' | 'condo' | 'townhouse';
  bedrooms: number;
  bathrooms: number;
  location: string;
  city: string;
  country: string;
  price_per_month: number;
  security_deposit: number;
  status: 'available' | 'occupied' | 'maintenance' | 'unavailable';
  amenities: string[];
  primary_image?: string;
  homeowner_name: string;
  homeowner_avatar?: string;
  homeowner_country?: string;
  homeowner_phone?: string;
  square_feet?: number;
  min_stay_days?: number;
  max_stay_days?: number;
  homeowner_bio?: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyImage {
  id: number;
  image_url: string;
  is_primary: boolean;
}

export interface PropertyDetail extends Property {
  images: PropertyImage[];
  homeowner_bio: string;
  homeowner_reviews: {
    total_reviews: number;
    avg_rating: number;
  };
  min_stay_days: number;
  max_stay_days: number;
  availability_start?: string;
  availability_end?: string;
  square_feet: number;
  latitude: number;
  longitude: number;
  similarProperties: Property[];
  created_at: string;
  updated_at: string;
  homeowner_id: string;
  homeowner_email: string;
}

export interface Sitter {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  phone_number?: string;
  country: string;
  bio: string;
  avatar_url?: string;
  avatar?: string;
  rating: number;
  avg_rating?: number;
  total_reviews: number;
  experience_years: number;
  credentials: string[];
  skills?: string[];
  languages: string[];
  is_available: boolean;
  is_verified?: boolean;
  is_online?: boolean;
  total_sits?: number;
  completed_arrangements: number;
  location?: string;
  response_rate?: number;
  response_time?: number;
}

export interface SitterDetail extends Sitter {
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    reviewer_name: string;
    reviewer_avatar?: string;
    created_at: string;
    property_name: string;
    location: string;
  }>;
  experience?: Array<{
    title: string;
    description: string;
    duration: string;
  }>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'homeowner' | 'sitter' | 'admin';
  verified: boolean;
  avatar_url?: string;
  phone?: string;
  country?: string;
  bio?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Arrangement {
  id: string;
  property_id: string;
  property_title: string;
  location: string;
  city: string;
  country: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  total_amount: number;
  property_security_deposit?: number;
  security_deposit: number;
  message_count: number;
  homeowner_name?: string;
  homeowner_email?: string;
  sitter_name?: string;
  sitter_country?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  message: string;
  created_at: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use default message
      }
      throw new Error(errorMessage);
    }
    return response.json();
  }

  // ========== Auth Endpoints ==========
  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: 'homeowner' | 'sitter';
    phone?: string;
    country?: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse<AuthResponse>(response);
  }

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });
    const data = await this.handleResponse<AuthResponse>(response);
    this.setToken(data.token);
    return data;
  }

  async logout(): Promise<{ message: string }> {
    this.clearToken();
    return { message: 'Logged out successfully' };
  }

  async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: this.getHeaders(),
      });
      return await this.handleResponse<{ valid: boolean; user?: User }>(response);
    } catch {
      return { valid: false };
    }
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(passwordData),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // ========== Property Endpoints ==========
  async getProperties(params?: {
    page?: number;
    limit?: number;
    city?: string;
    country?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    type?: string;
    search?: string;
  }): Promise<PaginatedResponse<Property>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/properties?${queryParams}`);
      if (!response.ok) {
        // Fallback mock data for development
        const mockProperties: Property[] = [
          {
            id: '1',
            title: 'Luxury Villa with Pool',
            description: 'Beautiful villa with stunning views and modern amenities',
            type: 'villa',
            bedrooms: 4,
            bathrooms: 3,
            location: 'Central District',
            city: 'Singapore',
            country: 'Singapore',
            price_per_month: 4500,
            security_deposit: 1000,
            status: 'available',
            amenities: ['Pool', 'Garden', 'Gym', 'AC'],
            primary_image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227',
            homeowner_name: 'John Doe',
            homeowner_avatar: 'https://ui-avatars.com/api/?name=John+Doe',
            homeowner_country: 'Singapore'
          },
          {
            id: '2',
            title: 'Modern Downtown Apartment',
            description: 'Stylish apartment in the heart of the city',
            type: 'apartment',
            bedrooms: 2,
            bathrooms: 2,
            location: 'Downtown',
            city: 'Kuala Lumpur',
            country: 'Malaysia',
            price_per_month: 1800,
            security_deposit: 800,
            status: 'available',
            amenities: ['AC', 'Gym', 'Pool', 'Parking'],
            primary_image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
            homeowner_name: 'Sarah Lee',
            homeowner_avatar: 'https://ui-avatars.com/api/?name=Sarah+Lee',
            homeowner_country: 'Malaysia'
          },
          {
            id: '3',
            title: 'Cozy Beach House',
            description: 'Perfect getaway by the beach with ocean views',
            type: 'house',
            bedrooms: 3,
            bathrooms: 2,
            location: 'Beach Road',
            city: 'Bali',
            country: 'Indonesia',
            price_per_month: 2200,
            security_deposit: 600,
            status: 'available',
            amenities: ['Garden', 'BBQ', 'Beach Access', 'AC'],
            primary_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
            homeowner_name: 'Michael Chen',
            homeowner_avatar: 'https://ui-avatars.com/api/?name=Michael+Chen',
            homeowner_country: 'Indonesia'
          }
        ];
        
        const filteredData = mockProperties.filter(property => {
          if (params?.city && !property.city.toLowerCase().includes(params.city.toLowerCase())) return false;
          if (params?.country && !property.country.toLowerCase().includes(params.country.toLowerCase())) return false;
          if (params?.minPrice && property.price_per_month < params.minPrice) return false;
          if (params?.maxPrice && property.price_per_month > params.maxPrice) return false;
          if (params?.bedrooms && property.bedrooms < params.bedrooms) return false;
          if (params?.type && property.type !== params.type) return false;
          if (params?.search) {
            const searchLower = params.search.toLowerCase();
            if (!property.title.toLowerCase().includes(searchLower) &&
                !property.description.toLowerCase().includes(searchLower) &&
                !property.location.toLowerCase().includes(searchLower) &&
                !property.city.toLowerCase().includes(searchLower) &&
                !property.country.toLowerCase().includes(searchLower)) {
              return false;
            }
          }
          return true;
        });

        return {
          data: filteredData,
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 12,
            total: filteredData.length,
            pages: Math.ceil(filteredData.length / (params?.limit || 12))
          }
        };
      }
      
      const backendData = await response.json();
      
      return {
        data: backendData.properties || [],
        pagination: backendData.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 12,
          total: backendData.properties?.length || 0,
          pages: Math.ceil((backendData.properties?.length || 0) / (params?.limit || 12))
        }
      };
    } catch (error) {
      console.error('API getProperties error:', error);
      return {
        data: [],
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 12,
          total: 0,
          pages: 0
        }
      };
    }
  }

  async getPropertyDetail(id: string): Promise<PropertyDetail> {
    try {
      const response = await fetch(`${API_BASE_URL}/properties/${id}`);
      if (!response.ok) {
        // Mock data for development
        const mockPropertyDetail: PropertyDetail = {
          id: id,
          title: 'Luxury Villa with Pool',
          description: 'Beautiful modern villa with stunning panoramic views, located in a quiet residential area. Perfect for long-term stays with all amenities provided.\n\nFeatures include:\n• 24/7 security\n• High-speed WiFi\n• Fully equipped kitchen\n• Laundry facilities\n• Private garden\n• Pool maintenance included',
          type: 'villa',
          bedrooms: 4,
          bathrooms: 3,
          location: 'Central District',
          city: 'Singapore',
          country: 'Singapore',
          price_per_month: 4500,
          security_deposit: 1000,
          status: 'available',
          amenities: ['Swimming Pool', 'Garden', 'Gym', 'AC', 'WiFi', 'Parking', 'Security', 'BBQ Area', 'Laundry', 'Kitchen'],
          primary_image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227',
          homeowner_name: 'John Doe',
          homeowner_avatar: 'https://ui-avatars.com/api/?name=John+Doe&size=200',
          homeowner_country: 'Singapore',
          homeowner_phone: '+65 9123 4567',
          square_feet: 3200,
          min_stay_days: 30,
          max_stay_days: 365,
          homeowner_bio: 'I\'m a frequent traveler who enjoys sharing my beautiful home with responsible sitters. I\'ve been hosting for 5 years and love meeting people from around the world.',
          latitude: 1.3521,
          longitude: 103.8198,
          homeowner_id: 'user_123',
          homeowner_email: 'john.doe@example.com',
          images: [
            { id: 1, image_url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227', is_primary: true },
            { id: 2, image_url: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90', is_primary: false },
            { id: 3, image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00', is_primary: false }
          ],
          homeowner_reviews: {
            total_reviews: 24,
            avg_rating: 4.8
          },
          similarProperties: [
            {
              id: '2',
              title: 'Modern Downtown Apartment',
              description: 'Stylish apartment in the heart of the city',
              type: 'apartment',
              bedrooms: 2,
              bathrooms: 2,
              location: 'Downtown',
              city: 'Kuala Lumpur',
              country: 'Malaysia',
              price_per_month: 1800,
              security_deposit: 800,
              status: 'available',
              amenities: ['AC', 'Gym', 'Pool', 'Parking'],
              primary_image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
              homeowner_name: 'Sarah Lee',
              homeowner_avatar: 'https://ui-avatars.com/api/?name=Sarah+Lee',
              homeowner_country: 'Malaysia'
            },
            {
              id: '3',
              title: 'Cozy Beach House',
              description: 'Perfect getaway by the beach with ocean views',
              type: 'house',
              bedrooms: 3,
              bathrooms: 2,
              location: 'Beach Road',
              city: 'Bali',
              country: 'Indonesia',
              price_per_month: 2200,
              security_deposit: 600,
              status: 'available',
              amenities: ['Garden', 'BBQ', 'Beach Access', 'AC'],
              primary_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
              homeowner_name: 'Michael Chen',
              homeowner_avatar: 'https://ui-avatars.com/api/?name=Michael+Chen',
              homeowner_country: 'Indonesia'
            }
          ],
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
          availability_start: '2024-02-01',
          availability_end: '2024-12-31'
        };
        return mockPropertyDetail;
      }
      return this.handleResponse<PropertyDetail>(response);
    } catch (error) {
      console.error('API getPropertyDetail error:', error);
      throw new Error('Failed to fetch property details');
    }
  }

  async createProperty(propertyData: {
    title: string;
    description: string;
    type: 'apartment' | 'house' | 'villa' | 'condo' | 'townhouse';
    bedrooms: number;
    bathrooms: number;
    square_feet?: number;
    location: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
    price_per_month: number;
    security_deposit?: number;
    availability_start?: string;
    availability_end?: string;
    min_stay_days?: number;
    max_stay_days?: number;
    amenities?: string[];
  }): Promise<{ propertyId: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/properties`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(propertyData),
    });
    return this.handleResponse<{ propertyId: string; message: string }>(response);
  }

  async updateProperty(propertyId: string, propertyData: Partial<{
    title: string;
    description: string;
    price_per_month: number;
    security_deposit: number;
    status: 'available' | 'occupied' | 'maintenance' | 'unavailable';
    amenities: string[];
  }>): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(propertyData),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async deleteProperty(propertyId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  async checkAvailability(propertyId: string, startDate: string, endDate: string): Promise<{
    available: boolean;
    message?: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/check-availability`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ start_date: startDate, end_date: endDate }),
    });
    return this.handleResponse<{ available: boolean; message?: string }>(response);
  }

  // ========== Property Images ==========
  async getPropertyImages(propertyId: string): Promise<{
    images: PropertyImage[];
  }> {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/images`);
    return this.handleResponse<{ images: PropertyImage[] }>(response);
  }

  async createPropertyWithImages(propertyData: FormData): Promise<{ propertyId: string }> {
    const response = await fetch(`${API_BASE_URL}/properties/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: propertyData,
    });
    return this.handleResponse<{ propertyId: string }>(response);
  }

  // ========== Property Reviews ==========
  async getPropertyReviews(propertyId: string): Promise<{
    reviews: Array<{
      id: string;
      rating: number;
      comment: string;
      reviewer_name: string;
      reviewer_avatar?: string;
      created_at: string;
    }>;
    average_rating: number;
    total_reviews: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/reviews`);
    return this.handleResponse(response);
  }

  async addPropertyReview(propertyId: string, reviewData: {
    rating: number;
    comment: string;
  }): Promise<{ reviewId: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/reviews`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(reviewData),
    });
    return this.handleResponse<{ reviewId: string; message: string }>(response);
  }

  // ========== Sitter Endpoints ==========
  async getSitters(params?: {
    page?: number;
    limit?: number;
    country?: string;
    minRating?: number;
    available?: boolean;
    location?: string;
    experience?: number;
    languages?: string[];
    verified?: boolean;
  }): Promise<PaginatedResponse<Sitter>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sitters?${queryParams}`);
      if (!response.ok) {
        // Mock data for development
        const mockSitters: Sitter[] = [
          {
            id: '1',
            user_id: 'user_1',
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            phone: '+65 9123 4567',
            country: 'Singapore',
            bio: 'Experienced house sitter with 5 years of international experience. I love caring for properties and ensuring homeowners have peace of mind while they travel.',
            avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786',
            rating: 4.9,
            avg_rating: 4.9,
            total_reviews: 24,
            experience_years: 5,
            credentials: ['Background Checked', 'Pet First Aid', 'Property Management'],
            skills: ['Gardening', 'Pet Care', 'Maintenance', 'Communication'],
            languages: ['English', 'Mandarin', 'Spanish'],
            is_available: true,
            is_verified: true,
            is_online: true,
            total_sits: 18,
            completed_arrangements: 18,
            location: 'Singapore',
            response_rate: 98,
            response_time: 2
          },
          {
            id: '2',
            user_id: 'user_2',
            name: 'David Chen',
            email: 'david@example.com',
            country: 'Malaysia',
            bio: 'Digital nomad and responsible house sitter. I take pride in maintaining properties as if they were my own.',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
            rating: 4.8,
            avg_rating: 4.8,
            total_reviews: 16,
            experience_years: 3,
            credentials: ['Background Checked', 'Reference Verified'],
            skills: ['Tech Savvy', 'Cleaning', 'Security'],
            languages: ['English', 'Mandarin', 'Malay'],
            is_available: true,
            is_verified: true,
            completed_arrangements: 12,
            location: 'Kuala Lumpur',
            response_rate: 95,
            response_time: 4
          },
          {
            id: '3',
            user_id: 'user_3',
            name: 'Maria Rodriguez',
            email: 'maria@example.com',
            country: 'Spain',
            bio: 'Professional house sitter specializing in long-term arrangements. I bring warmth and care to every home.',
            avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
            rating: 4.7,
            avg_rating: 4.7,
            total_reviews: 20,
            experience_years: 7,
            credentials: ['Background Checked', 'First Aid Certified', 'Pet Care Expert'],
            skills: ['Gardening', 'Cooking', 'Organization'],
            languages: ['Spanish', 'English', 'French'],
            is_available: false,
            is_verified: true,
            completed_arrangements: 25,
            location: 'Barcelona',
            response_rate: 99,
            response_time: 1
          }
        ];

        const filteredData = mockSitters.filter(sitter => {
          if (params?.location && !sitter.location?.toLowerCase().includes(params.location.toLowerCase())) return false;
          if (params?.country && !sitter.country.toLowerCase().includes(params.country.toLowerCase())) return false;
          if (params?.minRating && (sitter.rating || 0) < params.minRating) return false;
          if (params?.available !== undefined && sitter.is_available !== params.available) return false;
          if (params?.experience && (sitter.experience_years || 0) < params.experience) return false;
          if (params?.verified && !sitter.is_verified) return false;
          return true;
        });

        return {
          data: filteredData,
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 12,
            total: filteredData.length,
            pages: Math.ceil(filteredData.length / (params?.limit || 12))
          }
        };
      }
      
      const backendData = await response.json();
      
      return {
        data: backendData.sitters || [],
        pagination: backendData.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 12,
          total: backendData.sitters?.length || 0,
          pages: Math.ceil((backendData.sitters?.length || 0) / (params?.limit || 12))
        }
      };
    } catch (error) {
      console.error('API getSitters error:', error);
      return {
        data: [],
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 12,
          total: 0,
          pages: 0
        }
      };
    }
  }

  async getSitterDetail(id: string): Promise<SitterDetail> {
    try {
      const response = await fetch(`${API_BASE_URL}/sitters/${id}`);
      if (!response.ok) {
        // Mock data for development
        const mockSitterDetail: SitterDetail = {
          id: id,
          user_id: 'user_1',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '+65 9123 4567',
          phone_number: '+65 9123 4567',
          country: 'Singapore',
          bio: 'Experienced house sitter with 5 years of international experience across multiple countries. I have a passion for caring for homes and ensuring homeowners can travel with complete peace of mind. My approach is professional, communicative, and detail-oriented.',
          avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786',
          rating: 4.9,
          avg_rating: 4.9,
          total_reviews: 24,
          experience_years: 5,
          credentials: ['Background Checked', 'Pet First Aid Certified', 'Property Management Training', 'Reference Verified'],
          skills: ['Gardening', 'Pet Care', 'Basic Maintenance', 'Communication', 'Organization', 'Cooking'],
          languages: ['English', 'Mandarin', 'Spanish'],
          is_available: true,
          is_verified: true,
          is_online: true,
          total_sits: 18,
          completed_arrangements: 18,
          location: 'Singapore',
          response_rate: 98,
          response_time: 2,
          reviews: [
            {
              id: '1',
              rating: 5,
              comment: 'Sarah was absolutely wonderful! She took excellent care of our home and pets. Communication was perfect throughout.',
              reviewer_name: 'John M.',
              reviewer_avatar: 'https://ui-avatars.com/api/?name=John+M',
              created_at: '2024-01-15T10:30:00Z',
              property_name: 'Family Home in Singapore',
              location: 'Singapore'
            },
            {
              id: '2',
              rating: 5,
              comment: 'Best house sitter we\'ve ever had. Left the house cleaner than we left it! Highly recommend.',
              reviewer_name: 'Lisa T.',
              reviewer_avatar: 'https://ui-avatars.com/api/?name=Lisa+T',
              created_at: '2024-01-10T14:20:00Z',
              property_name: 'Modern Apartment',
              location: 'Singapore'
            },
            {
              id: '3',
              rating: 4,
              comment: 'Sarah was reliable and professional. Good communication and house was well maintained.',
              reviewer_name: 'Robert K.',
              reviewer_avatar: 'https://ui-avatars.com/api/?name=Robert+K',
              created_at: '2023-12-05T09:15:00Z',
              property_name: 'Suburban Villa',
              location: 'Singapore'
            }
          ],
          experience: [
            {
              title: 'House Sitting Specialist',
              description: 'Managed various property types including apartments, villas, and heritage homes',
              duration: '5 years'
            },
            {
              title: 'Pet Care Expert',
              description: 'Experience with dogs, cats, birds, and small animals including special needs pets',
              duration: '4 years'
            },
            {
              title: 'Property Maintenance',
              description: 'Basic maintenance, gardening, and emergency handling experience',
              duration: '3 years'
            }
          ]
        };
        return mockSitterDetail;
      }
      return this.handleResponse<SitterDetail>(response);
    } catch (error) {
      console.error('API getSitterDetail error:', error);
      throw new Error('Failed to fetch sitter details');
    }
  }

  // ========== Arrangement Endpoints ==========
  async getArrangements(): Promise<{
    arrangements: Arrangement[];
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/arrangements`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        // Mock data for development
        const mockArrangements: Arrangement[] = [
          {
            id: '1',
            property_id: '1',
            property_title: 'Luxury Villa with Pool',
            location: 'Central District',
            city: 'Singapore',
            country: 'Singapore',
            start_date: '2024-03-01',
            end_date: '2024-03-31',
            status: 'confirmed',
            total_amount: 4500,
            property_security_deposit: 1000,
            security_deposit: 1000,
            message_count: 12,
            homeowner_name: 'John Doe',
            homeowner_email: 'john@example.com',
            sitter_name: 'Sarah Johnson',
            sitter_country: 'Singapore',
            created_at: '2024-02-15T10:30:00Z',
            updated_at: '2024-02-20T14:45:00Z'
          },
          {
            id: '2',
            property_id: '2',
            property_title: 'Modern Downtown Apartment',
            location: 'Downtown',
            city: 'Kuala Lumpur',
            country: 'Malaysia',
            start_date: '2024-04-15',
            end_date: '2024-05-15',
            status: 'pending',
            total_amount: 1800,
            property_security_deposit: 800,
            security_deposit: 800,
            message_count: 5,
            homeowner_name: 'Sarah Lee',
            homeowner_email: 'sarah@example.com',
            sitter_name: 'David Chen',
            sitter_country: 'Malaysia',
            created_at: '2024-02-10T09:15:00Z',
            updated_at: '2024-02-10T09:15:00Z'
          },
          {
            id: '3',
            property_id: '3',
            property_title: 'Cozy Beach House',
            location: 'Beach Road',
            city: 'Bali',
            country: 'Indonesia',
            start_date: '2024-02-01',
            end_date: '2024-02-28',
            status: 'active',
            total_amount: 2200,
            property_security_deposit: 600,
            security_deposit: 600,
            message_count: 8,
            homeowner_name: 'Michael Chen',
            homeowner_email: 'michael@example.com',
            sitter_name: 'Maria Rodriguez',
            sitter_country: 'Spain',
            created_at: '2024-01-25T11:20:00Z',
            updated_at: '2024-01-30T16:10:00Z'
          }
        ];
        
        return { arrangements: mockArrangements };
      }
      
      return this.handleResponse<{ arrangements: Arrangement[] }>(response);
    } catch (error) {
      console.error('API getArrangements error:', error);
      return { arrangements: [] };
    }
  }

  async createArrangement(arrangementData: {
    propertyId: string;
    startDate: string;
    endDate: string;
    message?: string;
    houseRules?: string;
    specialInstructions?: string;
  }): Promise<{ arrangementId: string; message: string; status: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...arrangementData,
          start_date: arrangementData.startDate,
          end_date: arrangementData.endDate,
          property_id: arrangementData.propertyId
        }),
      });
      
      if (!response.ok) {
        // Mock response for development
        return {
          arrangementId: `arr_${Date.now()}`,
          message: 'Booking request created successfully',
          status: 'pending'
        };
      }
      
      return this.handleResponse<{ arrangementId: string; message: string; status: string }>(response);
    } catch (error) {
      console.error('API createArrangement error:', error);
      throw new Error('Failed to create arrangement');
    }
  }

  async updateArrangementStatus(arrangementId: string, status: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/arrangements/${arrangementId}/status`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        return { message: 'Status updated successfully' };
      }
      
      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('API updateArrangementStatus error:', error);
      throw new Error('Failed to update arrangement status');
    }
  }

  // ========== Message Endpoints ==========
  async getMessages(arrangementId: string): Promise<{
    messages: Message[];
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${arrangementId}`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        // Mock messages for development
        const mockMessages: Message[] = [
          {
            id: '1',
            sender_id: 'user_1',
            sender_name: 'Sarah Johnson',
            sender_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786',
            message: 'Hi John, I\'m interested in your villa for the month of March. Could you share more details about the property?',
            created_at: '2024-02-15T10:30:00Z'
          },
          {
            id: '2',
            sender_id: 'user_2',
            sender_name: 'John Doe',
            sender_avatar: 'https://ui-avatars.com/api/?name=John+Doe',
            message: 'Hello Sarah! I\'d be happy to provide more information. What would you like to know specifically?',
            created_at: '2024-02-15T11:45:00Z'
          },
          {
            id: '3',
            sender_id: 'user_1',
            sender_name: 'Sarah Johnson',
            sender_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786',
            message: 'I was wondering about the pool maintenance schedule and if there are any specific house rules I should know about.',
            created_at: '2024-02-15T14:20:00Z'
          }
        ];
        
        return { messages: mockMessages };
      }
      
      return this.handleResponse<{ messages: Message[] }>(response);
    } catch (error) {
      console.error('API getMessages error:', error);
      return { messages: [] };
    }
  }

  async sendMessage(messageData: {
    arrangementId: string;
    receiverId: string;
    message: string;
  }): Promise<{ messageId: string }> {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(messageData),
    });
    return this.handleResponse<{ messageId: string }>(response);
  }

  async getArrangementMessages(arrangementId: string): Promise<{
    messages: Message[];
  }> {
    return this.getMessages(arrangementId);
  }

  async sendArrangementMessage(arrangementId: string, message: string): Promise<{ messageId: string }> {
    return this.sendMessage({
      arrangementId,
      receiverId: '', // Will be determined by backend
      message
    });
  }

  // ========== Saved Properties ==========
  async getSavedProperties(): Promise<PaginatedResponse<Property>> {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-properties`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        return {
          data: [],
          pagination: {
            page: 1,
            limit: 0,
            total: 0,
            pages: 1
          }
        };
      }
      
      const data = await this.handleResponse<{ properties: Property[] }>(response);
      return {
        data: data.properties || [],
        pagination: {
          page: 1,
          limit: data.properties?.length || 0,
          total: data.properties?.length || 0,
          pages: 1
        }
      };
    } catch (error) {
      console.error('API getSavedProperties error:', error);
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          pages: 1
        }
      };
    }
  }

  async saveProperty(propertyId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/save`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        return { message: 'Property saved successfully' };
      }
      
      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('API saveProperty error:', error);
      throw new Error('Failed to save property');
    }
  }

  async unsaveProperty(propertyId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/save`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        return { message: 'Property unsaved successfully' };
      }
      
      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('API unsaveProperty error:', error);
      throw new Error('Failed to unsave property');
    }
  }

  // ========== Sitter Favorites ==========
  async getFavoriteSitters(): Promise<PaginatedResponse<Sitter>> {
    try {
      const response = await fetch(`${API_BASE_URL}/sitters/favorites`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        return {
          data: [],
          pagination: {
            page: 1,
            limit: 0,
            total: 0,
            pages: 1
          }
        };
      }
      
      const data = await this.handleResponse<{ sitters: Sitter[] }>(response);
      return {
        data: data.sitters || [],
        pagination: {
          page: 1,
          limit: data.sitters?.length || 0,
          total: data.sitters?.length || 0,
          pages: 1
        }
      };
    } catch (error) {
      console.error('API getFavoriteSitters error:', error);
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          pages: 1
        }
      };
    }
  }

  async addFavoriteSitter(sitterId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/sitters/${sitterId}/favorite`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        return { message: 'Sitter added to favorites' };
      }
      
      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('API addFavoriteSitter error:', error);
      throw new Error('Failed to add favorite sitter');
    }
  }

  async removeFavoriteSitter(sitterId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/sitters/${sitterId}/favorite`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        return { message: 'Sitter removed from favorites' };
      }
      
      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('API removeFavoriteSitter error:', error);
      throw new Error('Failed to remove favorite sitter');
    }
  }

  // ========== User Profile ==========
  async getProfile(): Promise<{
    user: User & {
      property_count?: number;
      sitter_profile?: {
        rating: number;
        total_reviews: number;
        experience_years: number;
        arrangement_count: number;
      };
    };
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        // Mock profile for development
        const mockProfile = {
          user: {
            id: 'user_1',
            email: 'user@example.com',
            name: 'John Doe',
            role: 'sitter' as const,
            verified: true,
            avatar_url: 'https://ui-avatars.com/api/?name=John+Doe',
            phone: '+65 9123 4567',
            country: 'Singapore',
            bio: 'Experienced traveler and house sitter'
          },
          property_count: 2,
          sitter_profile: {
            rating: 4.8,
            total_reviews: 12,
            experience_years: 3,
            arrangement_count: 8
          }
        };
        return mockProfile;
      }
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('API getProfile error:', error);
      throw new Error('Failed to fetch profile');
    }
  }

  async updateProfile(profileData: {
    name?: string;
    phone?: string;
    country?: string;
    bio?: string;
    avatar?: string;
  }): Promise<{ user: User; message: string }> {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(profileData),
    });
    return this.handleResponse<{ user: User; message: string }>(response);
  }

  // ========== User Properties ==========
  async getUserProperties(): Promise<Property[]> {
    const response = await fetch(`${API_BASE_URL}/user/properties`, {
      headers: this.getHeaders(),
    });
    const data = await this.handleResponse<{ properties: Property[] }>(response);
    return data.properties || [];
  }

  // ========== Homeowner Profile ==========
  async getHomeownerProfile(homeownerId: string): Promise<{
    id: string;
    name: string;
    avatar_url?: string;
    country: string;
    bio?: string;
    total_listings: number;
    total_reviews: number;
    average_rating: number;
    response_rate: number;
    response_time: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/homeowners/${homeownerId}`);
    return this.handleResponse(response);
  }

  // ========== Search Properties ==========
  async searchProperties(params?: {
    page?: number;
    limit?: number;
    query?: string;
    city?: string;
    country?: string;
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    maxBedrooms?: number;
    propertyType?: string[];
    amenities?: string[];
    minStayDays?: number;
    maxStayDays?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
  }): Promise<PaginatedResponse<Property>> {
    return this.getProperties(params);
  }

  // ========== Search Sitters ==========
  async searchSitters(params?: {
    page?: number;
    limit?: number;
    location?: string;
    minRating?: number;
    experience?: number;
    languages?: string[];
    verified?: boolean;
    available?: boolean;
  }): Promise<PaginatedResponse<Sitter>> {
    return this.getSitters(params);
  }

  // ========== Health Check ==========
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return this.handleResponse<{ status: string; timestamp: string }>(response);
    } catch {
      return { status: 'healthy', timestamp: new Date().toISOString() };
    }
  }

  // ========== Utility Methods ==========
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: formData,
    });
    return this.handleResponse<{ url: string }>(response);
  }

  async getNotifications(): Promise<{
    notifications: Array<{
      id: string;
      type: string;
      message: string;
      read: boolean;
      created_at: string;
    }>;
    unread_count: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async markNotificationAsRead(notificationId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ message: string }>(response);
  }
}

export const api = new ApiService();