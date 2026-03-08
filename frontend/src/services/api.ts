// src/services/api.ts - Updated with real Airbnb import
const API_BASE_URL = 'http://localhost:5000/api';


// Core Interfaces
// src/services/api.ts

export interface PropertyImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order?: number;
}

export interface PropertyDocument {
  id: string;
  document_type: string;
  document_url: string;
  verified: boolean;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  location: string;
  address?: string;
  city: string;
  country: string;
  price_per_month: number;
  security_deposit?: number;
  status: string;
  verification_status?: string;
  amenities: string[];
  images?: PropertyImage[];
  primary_image?: string | null;
  documents?: PropertyDocument[];
  homeowner_name?: string;
  homeowner_avatar?: string | null;
  homeowner_country?: string;
  homeowner_verified?: boolean;
  homeowner_phone?: string;
  homeowner_whatsapp?: string;
  square_feet?: number | null;
  min_stay_days?: number;
  max_stay_days?: number;
  latitude?: number | null;
  longitude?: number | null;
  availability_start?: string;
  availability_end?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PropertyDetail extends Property {
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  availability_start?: string;
  availability_end?: string;
  house_rules?: string;
  website_url?: string;
  airbnb_url?: string;
  virtual_tour_url?: string;
  similarProperties?: SimilarProperty[];
  homeowner_id?: string;
  homeowner_email?: string;
  homeowner_bio?: string;
  homeowner_reviews?: {
    total_reviews: number;
    avg_rating: number;
  };
}

export interface SimilarProperty {
  id: string;
  title: string;
  location: string;
  city: string;
  country: string;
  price_per_month: number;
  min_stay_days?: number;
  primary_image?: string | null;
}

// In api.ts, update the Sitter interface
export interface Sitter {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  phone_number?: string;
  country: string;
  city?: string;  // Add this line
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
  preferred_duration?: string;
  airbnb_verified?: boolean;
  credit_score?: number;
  bank_verified?: boolean;
  linkedin_verified?: boolean;
  transaction_count?: number;
  whatsapp_number?: string;
  min_credit_score?: number;
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
  is_verified?: boolean;
  avatar_url?: string;
  phone?: string;
  country?: string;
  bio?: string;
  whatsapp?: string;
  created_at?: string;
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
  monthly_amount: number;
  property_security_deposit?: number;
  security_deposit: number;
  message_count: number;
  homeowner_name?: string;
  homeowner_email?: string;
  sitter_name?: string;
  sitter_country?: string;
  created_at: string;
  updated_at: string;
  sitter_verification_status?: string;
  transaction_count?: number;
  whatsapp_number?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  message: string;
  created_at: string;
}

export interface AirbnbImportResponse {
  success: boolean;
  data: {
    title: string;
    description: string;
    type: string;
    bedrooms: number;
    bathrooms: number;
    location: string;
    city: string;
    country: string;
    price_per_month: number;
    security_deposit: number;
    amenities: string[];
    square_feet: number | null;
    images?: string[];
    host_name?: string;
    host_avatar?: string | null;
    property_url: string;
    source_platform: string;
    source_url: string;
    original_listing_id: string;
  };
  error?: string;
}

// Admin Interfaces
export interface DashboardStats {
  users: {
    total: number;
    homeowners: number;
    sitters: number;
    verified_users: number;
    pending_verifications: number;
  };
  properties: {
    total: number;
    pending_approval: number;
    pending_verification: number;
    available: number;
  };
  arrangements: {
    total: number;
    pending: number;
    active: number;
    completed: number;
  };
  pending_requests: number;
  recent_activities: Array<{ action_type: string; count: number }>;
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  entity_type: 'user' | 'property' | 'sitter';
  entity_id: string;
  entity_name: string;
  request_type: string;
  status: string;
  requested_data: any;
  admin_notes: string;
  reviewed_by: string;
  reviewed_at: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  admin_email: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  action_details: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface SystemStats {
  dailyRegistrations: Array<{ date: string; count: number }>;
  roleDistribution: Array<{ role: string; count: number }>;
  propertyTypes: Array<{ type: string; count: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number; bookings: number }>;
  verificationStats: {
    pending_users: number;
    approved_users: number;
    pending_properties: number;
    approved_properties: number;
  };
}

export interface AdminStats {
  users: {
    total: number;
    homeowners: number;
    sitters: number;
    verified_users: number;
    pending_verifications: number;
    admins?: number;
  };
  properties: {
    total: number;
    pending_approval: number;
    pending_verification: number;
    available: number;
  };
  arrangements: {
    total: number;
    pending: number;
    active: number;
    completed: number;
  };
  pending_requests: number;
  recent_activities: Array<{ action_type: string; count: number }>;
}

// Mock data for development when backend is empty
const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Luxury Villa with Pool',
    description: 'Beautiful villa with stunning views and modern amenities. Perfect for long-term stays.',
    type: 'villa',
    bedrooms: 4,
    bathrooms: 3,
    location: 'Hollywood Hills',
    city: 'Los Angeles',
    country: 'USA',
    price_per_month: 4500,
    security_deposit: 1000,
    status: 'available',
    amenities: ['Pool', 'Garden', 'Gym', 'WiFi', 'Parking'],
    primary_image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227',
    homeowner_name: 'John Doe',
    homeowner_avatar: 'https://ui-avatars.com/api/?name=John+Doe',
    homeowner_country: 'USA',
    min_stay_days: 30,
    max_stay_days: 365,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Cozy Downtown Apartment',
    description: 'Modern apartment in the heart of the city with amazing views.',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    location: 'Downtown',
    city: 'New York',
    country: 'USA',
    price_per_month: 2800,
    security_deposit: 800,
    status: 'available',
    amenities: ['WiFi', 'Gym', 'Parking', 'AC'],
    primary_image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
    homeowner_name: 'Jane Smith',
    homeowner_avatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
    homeowner_country: 'USA',
    min_stay_days: 30,
    max_stay_days: 365,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Beachfront Paradise',
    description: 'Stunning beachfront property with direct access to the beach.',
    type: 'house',
    bedrooms: 3,
    bathrooms: 2,
    location: 'Beach Road',
    city: 'Miami',
    country: 'USA',
    price_per_month: 3500,
    security_deposit: 900,
    status: 'available',
    amenities: ['Beach Access', 'Pool', 'Garden', 'WiFi'],
    primary_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    homeowner_name: 'Mike Johnson',
    homeowner_avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson',
    homeowner_country: 'USA',
    min_stay_days: 30,
    max_stay_days: 365,
    created_at: new Date().toISOString()
  }
];

const MOCK_SITTERS: Sitter[] = [
  {
    id: '1',
    user_id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    country: 'USA',
    bio: 'Experienced house sitter with 5 years of experience. Love pets and plants!',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786',
    rating: 4.9,
    total_reviews: 24,
    experience_years: 5,
    credentials: ['Background Checked', 'Pet First Aid'],
    skills: ['Pet Care', 'Gardening', 'Cleaning'],
    languages: ['English', 'Spanish'],
    is_available: true,
    is_verified: true,
    completed_arrangements: 18,
    response_rate: 98,
    response_time: 2
  },
  {
    id: '2',
    user_id: '2',
    name: 'David Chen',
    email: 'david@example.com',
    country: 'Canada',
    bio: 'Responsible and reliable sitter. Experience with luxury homes.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    rating: 4.8,
    total_reviews: 16,
    experience_years: 3,
    credentials: ['Background Checked', 'Security Certified'],
    skills: ['Security', 'Maintenance', 'Communication'],
    languages: ['English', 'Mandarin'],
    is_available: true,
    is_verified: true,
    completed_arrangements: 12,
    response_rate: 95,
    response_time: 3
  }
];

// ========== API SERVICE CLASS ==========
class ApiService {
  private token: string | null = null;

  // ========== TOKEN MANAGEMENT ==========
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

  // ========== AUTH ENDPOINTS ==========
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
    
    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('Email already registered. Please use a different email or login.');
      }
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use default message
      }
      throw new Error(errorMessage);
    }
    
    const data = await this.handleResponse<AuthResponse>(response);
    this.setToken(data.token);
    return data;
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

  // ========== AIRBNB IMPORT ENDPOINT - UPDATED TO USE REAL DATA ==========
  async importFromAirbnb(airbnbUrl: string): Promise<AirbnbImportResponse> {
    if (!airbnbUrl.includes('airbnb.com')) {
      throw new Error('Please enter a valid Airbnb URL');
    }

    try {
      console.log('Importing real Airbnb data from:', airbnbUrl);
      
      const token = this.getToken();
      if (!token) {
        throw new Error('You must be logged in to import from Airbnb');
      }

      const response = await fetch(`${API_BASE_URL}/real-listing/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: airbnbUrl })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Import failed (${response.status})`);
        } else {
          throw new Error(`Server error (${response.status}). Please try again.`);
        }
      }

      const data = await response.json();
      console.log('Airbnb import successful:', data);
      return data;
      
    } catch (error) {
      console.error('API importFromAirbnb error:', error);
      throw error;
    }
  }

  // ========== PROPERTY ENDPOINTS ==========
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
    status?: string;
    minStayDays?: number;
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
      console.log('Fetching properties from:', `${API_BASE_URL}/properties?${queryParams}`);
      const response = await fetch(`${API_BASE_URL}/properties?${queryParams}`);
      
      if (!response.ok) {
        console.warn('API returned error, using mock data');
        // Return mock data on error
        return {
          data: MOCK_PROPERTIES,
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 12,
            total: MOCK_PROPERTIES.length,
            pages: Math.ceil(MOCK_PROPERTIES.length / (params?.limit || 12))
          }
        };
      }
      
      const backendData = await response.json();
      console.log('Properties API response:', backendData);
      
      // Handle your backend response format - which has { properties: [...], pagination: {...} }
      if (backendData.properties && Array.isArray(backendData.properties)) {
        return {
          data: backendData.properties,
          pagination: backendData.pagination || {
            page: params?.page || 1,
            limit: params?.limit || 12,
            total: backendData.properties.length,
            pages: Math.ceil(backendData.properties.length / (params?.limit || 12))
          }
        };
      } 
      // Handle if response has data array directly
      else if (backendData.data && Array.isArray(backendData.data)) {
        return {
          data: backendData.data,
          pagination: backendData.pagination || {
            page: params?.page || 1,
            limit: params?.limit || 12,
            total: backendData.data.length,
            pages: Math.ceil(backendData.data.length / (params?.limit || 12))
          }
        };
      }
      // Handle if response is just an array
      else if (Array.isArray(backendData)) {
        return {
          data: backendData,
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 12,
            total: backendData.length,
            pages: Math.ceil(backendData.length / (params?.limit || 12))
          }
        };
      } 
      // If no data, return empty array
      else {
        console.warn('No properties found in response, returning empty array');
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
    } catch (error) {
      console.error('API getProperties error:', error);
      // Return empty array on error instead of mock data
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return this.handleResponse<PropertyDetail>(response);
    } catch (error) {
      console.error('API getPropertyDetail error:', error);
      throw error;
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
    rules?: string;
    website_url?: string;
    virtual_tour_url?: string;
    airbnb_url?: string;
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

  // ========== PROPERTY IMAGES ==========
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

  // ========== SITTER ENDPOINTS ==========
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
    search?: string;
    min_credit_score?: number;
  }): Promise<PaginatedResponse<Sitter>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Handle array parameters
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    try {
      console.log('Fetching sitters from:', `${API_BASE_URL}/sitters?${queryParams}`);
      const response = await fetch(`${API_BASE_URL}/sitters?${queryParams}`);
      
      if (!response.ok) {
        console.warn('Sitters API returned error, returning empty array');
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
      
      const backendData = await response.json();
      console.log('Sitters API response:', backendData);
      
      // Handle your backend response format - it returns { data: [...], pagination: {...} }
      if (backendData.data && Array.isArray(backendData.data)) {
        return {
          data: backendData.data,
          pagination: backendData.pagination || {
            page: params?.page || 1,
            limit: params?.limit || 12,
            total: backendData.data.length,
            pages: Math.ceil(backendData.data.length / (params?.limit || 12))
          }
        };
      } else if (backendData.sitters && Array.isArray(backendData.sitters)) {
        return {
          data: backendData.sitters,
          pagination: backendData.pagination || {
            page: params?.page || 1,
            limit: params?.limit || 12,
            total: backendData.sitters.length,
            pages: Math.ceil(backendData.sitters.length / (params?.limit || 12))
          }
        };
      } else if (Array.isArray(backendData)) {
        return {
          data: backendData,
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 12,
            total: backendData.length,
            pages: Math.ceil(backendData.length / (params?.limit || 12))
          }
        };
      } else {
        console.warn('No sitters found in response, returning empty array');
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return this.handleResponse<SitterDetail>(response);
    } catch (error) {
      console.error('API getSitterDetail error:', error);
      throw error;
    }
  }

  // ========== SITTER FAVORITES ==========
  async getFavoriteSitters(): Promise<PaginatedResponse<Sitter>> {
    try {
      const token = this.getToken();
      if (!token) {
        return { data: [], pagination: { page: 1, limit: 0, total: 0, pages: 1 } };
      }

      const response = await fetch(`${API_BASE_URL}/sitters/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('Favorites endpoint not found, returning empty array');
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Favorite sitters response:', data);
      
      // Handle your backend response format - it returns { data: [...], pagination: {...} }
      if (data.data && Array.isArray(data.data)) {
        return {
          data: data.data,
          pagination: data.pagination || {
            page: 1,
            limit: data.data.length,
            total: data.data.length,
            pages: 1
          }
        };
      } else if (Array.isArray(data)) {
        return {
          data: data,
          pagination: {
            page: 1,
            limit: data.length,
            total: data.length,
            pages: 1
          }
        };
      } else {
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
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/sitters/${sitterId}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('API addFavoriteSitter error:', error);
      throw error;
    }
  }

  async removeFavoriteSitter(sitterId: string): Promise<{ message: string }> {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/sitters/${sitterId}/favorite`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('API removeFavoriteSitter error:', error);
      throw error;
    }
  }

  // ========== SITTER PROFILE CREATION/UPDATE ==========
  async createSitterProfile(formData: FormData): Promise<{ message: string; sitterId: string }> {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/sitters/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save profile' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      return this.handleResponse<{ message: string; sitterId: string }>(response);
    } catch (error) {
      console.error('API createSitterProfile error:', error);
      throw error;
    }
  }

  // ========== SITTER EXPERIENCE ==========
  async addSitterExperience(sitterId: string, experience: {
    title: string;
    description: string;
    duration: string;
  }): Promise<{ message: string; experienceId: string }> {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/sitters/${sitterId}/experience`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(experience)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return this.handleResponse<{ message: string; experienceId: string }>(response);
    } catch (error) {
      console.error('API addSitterExperience error:', error);
      throw error;
    }
  }

  // ========== ARRANGEMENT ENDPOINTS ==========
  async getArrangements(): Promise<{
    arrangements: Arrangement[];
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/arrangements`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.arrangements) {
        return { arrangements: data.arrangements };
      } else if (Array.isArray(data)) {
        return { arrangements: data };
      } else {
        return { arrangements: [] };
      }
    } catch (error) {
      console.error('API getArrangements error:', error);
      throw error;
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
      const response = await fetch(`${API_BASE_URL}/arrangements`, {
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return this.handleResponse<{ arrangementId: string; message: string; status: string }>(response);
    } catch (error) {
      console.error('API createArrangement error:', error);
      throw error;
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('API updateArrangementStatus error:', error);
      throw error;
    }
  }

  // ========== SEND NOTICE TO VACATE ==========
  async sendNoticeToVacate(arrangementId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/arrangements/${arrangementId}/notice-to-vacate`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('API sendNoticeToVacate error:', error);
      throw error;
    }
  }

  // ========== MESSAGE ENDPOINTS ==========
  async getMessages(arrangementId: string): Promise<{
    messages: Message[];
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${arrangementId}`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.messages) {
        return { messages: data.messages };
      } else if (Array.isArray(data)) {
        return { messages: data };
      } else {
        return { messages: [] };
      }
    } catch (error) {
      console.error('API getMessages error:', error);
      throw error;
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
      receiverId: '',
      message
    });
  }

  // ========== SAVED PROPERTIES ==========
  async getSavedProperties(): Promise<PaginatedResponse<Property>> {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-properties`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.properties) {
        return {
          data: data.properties,
          pagination: data.pagination || {
            page: 1,
            limit: data.properties.length,
            total: data.properties.length,
            pages: 1
          }
        };
      } else if (Array.isArray(data)) {
        return {
          data: data,
          pagination: {
            page: 1,
            limit: data.length,
            total: data.length,
            pages: 1
          }
        };
      } else {
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
    } catch (error) {
      console.error('API getSavedProperties error:', error);
      throw error;
    }
  }

  async saveProperty(propertyId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-properties/${propertyId}`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('API saveProperty error:', error);
      throw error;
    }
  }

  async unsaveProperty(propertyId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-properties/${propertyId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('API unsaveProperty error:', error);
      throw error;
    }
  }

  // ========== USER PROFILE ==========
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('API getProfile error:', error);
      throw error;
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

  // ========== USER PROPERTIES ==========
  async getUserProperties(): Promise<Property[]> {
    const response = await fetch(`${API_BASE_URL}/user/properties`, {
      headers: this.getHeaders(),
    });
    const data = await this.handleResponse<{ properties: Property[] }>(response);
    return data.properties || [];
  }

  // ========== HOMEOWNER PROFILE ==========
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

  // ========== SEARCH PROPERTIES ==========
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

  // ========== SEARCH SITTERS ==========
  async searchSitters(params?: {
    page?: number;
    limit?: number;
    location?: string;
    country?: string;
    minRating?: number;
    experience?: number;
    languages?: string[];
    verified?: boolean;
    available?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<Sitter>> {
    return this.getSitters({
      page: params?.page,
      limit: params?.limit,
      location: params?.location,
      country: params?.country,
      minRating: params?.minRating,
      experience: params?.experience,
      languages: params?.languages,
      verified: params?.verified,
      available: params?.available,
      search: params?.search
    });
  }

  // ========== HEALTH CHECK ==========
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return this.handleResponse<{ status: string; timestamp: string }>(response);
    } catch (error) {
      console.error('API healthCheck error:', error);
      throw error;
    }
  }

  // ========== IMAGE UPLOAD ==========
  async uploadImage(file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        console.warn('Upload endpoint not available, continuing without image upload');
        return { url: '' };
      }
      
      return this.handleResponse<{ url: string }>(response);
    } catch (error) {
      console.warn('Image upload failed, continuing without image:', error);
      return { url: '' };
    }
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

  // ========== ADMIN ENDPOINTS ==========
  async getAdminStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return this.handleResponse<DashboardStats>(response);
    } catch (error) {
      console.error('API getAdminStats error:', error);
      throw error;
    }
  }

  async getAdminUsers(params?: { page?: number; limit?: number; role?: string }): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await this.handleResponse<any>(response);
      
      if (data.users) {
        return {
          data: data.users,
          pagination: data.pagination || {
            page: params?.page || 1,
            limit: params?.limit || 20,
            total: data.users.length,
            pages: Math.ceil(data.users.length / (params?.limit || 20))
          }
        };
      } else if (Array.isArray(data)) {
        return {
          data: data,
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 20,
            total: data.length,
            pages: Math.ceil(data.length / (params?.limit || 20))
          }
        };
      } else {
        return {
          data: [],
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 20,
            total: 0,
            pages: 0
          }
        };
      }
    } catch (error) {
      console.error('API getAdminUsers error:', error);
      throw error;
    }
  }
// ========== MISSING ADMIN METHODS ==========

/**
 * Get audit logs
 */
async getAuditLogs(params?: { limit?: number; offset?: number; userId?: string }): Promise<AuditLog[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/audit-logs?${queryParams}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      console.warn('Audit logs endpoint not available, returning empty array');
      return [];
    }
    
    const data = await response.json();
    return data.auditLogs || data.logs || data.data || data || [];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}

/**
 * Get pending verifications
 */
async getPendingVerifications(): Promise<VerificationRequest[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/pending-verifications`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      console.warn('Pending verifications endpoint not available, returning empty array');
      return [];
    }
    
    const data = await response.json();
    return data.verifications || data.data || data.requests || data.pending || data || [];
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    return [];
  }
}

/**
 * Get pending properties
 */
async getPendingProperties(): Promise<Property[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/pending/properties`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      console.warn('Pending properties endpoint not available, returning empty array');
      return [];
    }
    
    const data = await response.json();
    return data.properties || data.data || data || [];
  } catch (error) {
    console.error('Error fetching pending properties:', error);
    return [];
  }
}

/**
 * Get pending sitters
 */
async getPendingSitters(): Promise<Sitter[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/pending/sitters`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      console.warn('Pending sitters endpoint not available, returning empty array');
      return [];
    }
    
    const data = await response.json();
    return data.sitters || data.data || data || [];
  } catch (error) {
    console.error('Error fetching pending sitters:', error);
    return [];
  }
}

/**
 * Verify an entity (property, sitter, user)
 */
async verifyEntity(entityType: string, id: string, data: { approved: boolean; notes?: string }): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/verify/${entityType}/${id}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await this.handleResponse<{ success: boolean; message: string }>(response);
  } catch (error) {
    console.error(`Error verifying ${entityType}:`, error);
    throw error;
  }
}

/**
 * Add verification notes
 */
async addVerificationNotes(entityType: string, id: string, notes: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/notes/${entityType}/${id}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ notes })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await this.handleResponse<{ success: boolean; message: string }>(response);
  } catch (error) {
    console.error(`Error adding notes to ${entityType}:`, error);
    throw error;
  }
}

/**
 * Request more information
 */
async requestMoreInfo(entityType: string, id: string, message: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/request-info/${entityType}/${id}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ message })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await this.handleResponse<{ success: boolean; message: string }>(response);
  } catch (error) {
    console.error(`Error requesting info for ${entityType}:`, error);
    throw error;
  }
}

/**
 * Get user details
 */
async getUserDetails(userId: string): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await this.handleResponse<any>(response);
    return data.user || data.data || data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
}

/**
 * Get property details (admin view)
 */
async getPropertyDetails(propertyId: string): Promise<PropertyDetail> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/properties/${propertyId}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await this.handleResponse<any>(response);
    return data.property || data.data || data;
  } catch (error) {
    console.error('Error fetching property details:', error);
    throw error;
  }
}

/**
 * Get system statistics
 */
async getSystemStats(): Promise<SystemStats> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/system-stats`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      console.warn('System stats endpoint not available, returning default stats');
      return {
        dailyRegistrations: [],
        roleDistribution: [],
        propertyTypes: [],
        monthlyRevenue: [],
        verificationStats: {
          pending_users: 0,
          approved_users: 0,
          pending_properties: 0,
          approved_properties: 0
        }
      };
    }
    
    const data = await this.handleResponse<any>(response);
    return data.stats || data.data || data;
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return {
      dailyRegistrations: [],
      roleDistribution: [],
      propertyTypes: [],
      monthlyRevenue: [],
      verificationStats: {
        pending_users: 0,
        approved_users: 0,
        pending_properties: 0,
        approved_properties: 0
      }
    };
  }
}
  async getAdminProperties(params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<Property>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/properties?${queryParams}`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await this.handleResponse<any>(response);
      
      if (data.properties) {
        return {
          data: data.properties,
          pagination: data.pagination || {
            page: params?.page || 1,
            limit: params?.limit || 20,
            total: data.properties.length,
            pages: Math.ceil(data.properties.length / (params?.limit || 20))
          }
        };
      } else if (Array.isArray(data)) {
        return {
          data: data,
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 20,
            total: data.length,
            pages: Math.ceil(data.length / (params?.limit || 20))
          }
        };
      } else {
        return {
          data: [],
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 20,
            total: 0,
            pages: 0
          }
        };
      }
    } catch (error) {
      console.error('API getAdminProperties error:', error);
      throw error;
    }
  }

  async approveProperty(propertyId: string, notes?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/properties/${propertyId}/approve`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ notes })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await this.handleResponse<{ success: boolean; message: string }>(response);
    } catch (error) {
      console.error('❌ approveProperty error:', error);
      throw error;
    }
  }

  async rejectProperty(propertyId: string, reason: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/properties/${propertyId}/reject`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await this.handleResponse<{ success: boolean; message: string }>(response);
    } catch (error) {
      console.error('❌ rejectProperty error:', error);
      throw error;
    }
  }

  async updateUserRole(userId: string, role: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ role })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await this.handleResponse<{ success: boolean; message: string }>(response);
    } catch (error) {
      console.error('❌ updateUserRole error:', error);
      throw error;
    }
  }

  async toggleUserSuspension(userId: string, action: 'suspend' | 'unsuspend', reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await this.handleResponse<{ success: boolean; message: string }>(response);
    } catch (error) {
      console.error('❌ toggleUserSuspension error:', error);
      throw error;
    }
  }
}

// ========== EXPORT ==========
export const api = new ApiService();