import React, { useState } from 'react';
import { AMENITIES, DURATION_OPTIONS } from '../constants';
import { api } from '../services/api';

// Define form data interface
interface PropertyFormData {
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
  amenities: string[];
  rules: string;
  website_url?: string;
  virtual_tour_url?: string;
  photos: File[];
  square_feet?: number;
  min_stay_days?: number;
  max_stay_days?: number;
}

export const PropertyListing: React.FC = () => {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    type: 'house',
    bedrooms: 1,
    bathrooms: 1,
    location: '',
    city: '',
    country: '',
    price_per_month: 0,
    security_deposit: 0,
    amenities: [],
    rules: '',
    website_url: '',
    virtual_tour_url: '',
    photos: [],
    square_feet: undefined,
    min_stay_days: 30,
    max_stay_days: 365,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const toggleAmenity = (id: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(id) 
        ? prev.amenities.filter(a => a !== id)
        : [...prev.amenities, id]
    }));
  };

  // Handle file upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = e.target.files;
    if (files && files[0]) {
      const newPhotos = [...formData.photos];
      newPhotos[index] = files[0];
      setFormData({...formData, photos: newPhotos});
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPreviews = [...photoPreviews];
        newPreviews[index] = e.target?.result as string;
        setPhotoPreviews(newPreviews);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  // Handle form submission - SIMPLIFIED VERSION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log('Starting property submission...');
      
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Property title is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Property description is required');
      }
      if (!formData.location.trim()) {
        throw new Error('Property location is required');
      }
      if (!formData.city.trim()) {
        throw new Error('City is required');
      }
      if (!formData.country.trim()) {
        throw new Error('Country is required');
      }
      if (formData.price_per_month <= 0) {
        throw new Error('Monthly price must be greater than 0');
      }

      // Check if user is logged in
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      if (!token) {
        throw new Error('Please log in to list a property');
      }

      // OPTION 1: Use the api.createProperty method from your API service
      console.log('Using api.createProperty method...');
      
      const propertyData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        location: formData.location,
        city: formData.city,
        country: formData.country,
        price_per_month: formData.price_per_month,
        security_deposit: formData.security_deposit,
        amenities: formData.amenities,
        square_feet: formData.square_feet,
        min_stay_days: formData.min_stay_days,
        max_stay_days: formData.max_stay_days,
        rules: formData.rules,
        website_url: formData.website_url,
        virtual_tour_url: formData.virtual_tour_url
      };

      console.log('Property data to send:', propertyData);
      
      // Try using your existing API service
      try {
        const response = await api.createProperty(propertyData);
        console.log('API response:', response);
        
        // Upload photos separately if any
        if (formData.photos.length > 0) {
          console.log('Uploading photos...');
          for (const photo of formData.photos) {
            if (photo) {
              try {
                await api.uploadImage(photo);
                console.log('Photo uploaded successfully');
              } catch (photoError) {
                console.warn('Failed to upload photo:', photoError);
                // Continue even if photo upload fails
              }
            }
          }
        }
        
        setSuccess(true);
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          type: 'house',
          bedrooms: 1,
          bathrooms: 1,
          location: '',
          city: '',
          country: '',
          price_per_month: 0,
          security_deposit: 0,
          amenities: [],
          rules: '',
          website_url: '',
          virtual_tour_url: '',
          photos: [],
          square_feet: undefined,
          min_stay_days: 30,
          max_stay_days: 365,
        });
        setPhotoPreviews([]);

        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
        
      } catch (apiError: any) {
        console.error('API error:', apiError);
        throw new Error(apiError.message || 'Failed to create property via API');
      }

    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      setError(err.message || 'An error occurred while submitting the listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="list-property" className="max-w-4xl mx-auto px-4 py-20">
      <form onSubmit={handleSubmit}>
        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600">
            <i className="fas fa-check-circle mr-2"></i>
            Property listed successfully! It will appear after verification.
          </div>
        )}

        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-dark mb-4">List Your Property</h2>
          <p className="text-lg text-gray">
            Find trusted live-in caretakers for your home while you're away.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-8 md:p-12 space-y-12">
            
            {/* Basic Information Section */}
            <section>
              <h3 className="text-2xl font-bold text-dark mb-6 flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <i className="fas fa-home text-primary"></i>
                </div>
                Basic Information
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block font-semibold text-dark mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Beautiful 3-bedroom house in..."
                    className="w-full p-3.5 bg-white border-2 border-border rounded-xl focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-dark mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your property, neighborhood, nearby amenities..."
                    rows={4}
                    className="w-full p-3.5 bg-white border-2 border-border rounded-xl focus:outline-none focus:border-primary resize-none"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-semibold text-dark mb-2">
                      Property Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className="w-full p-3.5 bg-white border-2 border-border rounded-xl focus:outline-none focus:border-primary"
                    >
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="villa">Villa</option>
                      <option value="condo">Condo</option>
                      <option value="townhouse">Townhouse</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block font-semibold text-dark mb-2">
                      Monthly Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray">$</span>
                      <input
                        type="number"
                        min="1"
                        value={formData.price_per_month || ''}
                        onChange={(e) => setFormData({...formData, price_per_month: parseInt(e.target.value) || 0})}
                        className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-border rounded-xl focus:outline-none focus:border-primary"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-dark mb-2">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="City"
                      className="w-full p-3.5 bg-white border-2 border-border rounded-xl focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block font-semibold text-dark mb-2">Country *</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      placeholder="Country"
                      className="w-full p-3.5 bg-white border-2 border-border rounded-xl focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block font-semibold text-dark mb-2">Location *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Street address or neighborhood"
                      className="w-full p-3.5 bg-white border-2 border-border rounded-xl focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-semibold text-dark mb-2">Square Feet (Optional)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={formData.square_feet || ''}
                        onChange={(e) => setFormData({...formData, square_feet: parseInt(e.target.value) || undefined})}
                        className="w-full p-3.5 bg-white border-2 border-border rounded-xl focus:outline-none focus:border-primary"
                        placeholder="e.g., 1500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block font-semibold text-dark mb-2">Minimum Stay Days</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.min_stay_days}
                      onChange={(e) => setFormData({...formData, min_stay_days: parseInt(e.target.value) || 30})}
                      className="w-full p-3.5 bg-white border-2 border-border rounded-xl focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Property Photos */}
            <section>
              <h3 className="text-2xl font-bold text-dark mb-6 flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <i className="fas fa-camera text-primary"></i>
                </div>
                Property Photos
              </h3>
              <div className="space-y-4">
                <p className="text-gray">Upload clear photos of your property (8 maximum)</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <label key={i} className="aspect-square bg-light-gray rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer text-gray overflow-hidden relative">
                      {photoPreviews[i] ? (
                        <div className="w-full h-full">
                          <img 
                            src={photoPreviews[i]} 
                            alt={`Preview ${i}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center">
                            <i className="fas fa-check text-xs"></i>
                          </div>
                        </div>
                      ) : (
                        <>
                          <i className="fas fa-plus text-2xl mb-2"></i>
                          <span className="text-xs">Add Photo</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, i)}
                        className="hidden"
                        name={`photo-${i}`}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* Property Details */}
            <section>
              <h3 className="text-2xl font-bold text-dark mb-8 flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <i className="fas fa-info-circle text-primary"></i>
                </div>
                Property Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <label className="block font-semibold text-dark">Bedrooms</label>
                  <div className="flex items-center space-x-6">
                    <button 
                      type="button"
                      onClick={() => setFormData(p => ({...p, bedrooms: Math.max(1, p.bedrooms - 1)}))}
                      className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center hover:border-primary transition-colors"
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <span className="text-3xl font-bold text-dark min-w-[40px] text-center">{formData.bedrooms}</span>
                    <button 
                      type="button"
                      onClick={() => setFormData(p => ({...p, bedrooms: p.bedrooms + 1}))}
                      className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center hover:border-primary transition-colors"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="block font-semibold text-dark">Bathrooms</label>
                  <div className="flex items-center space-x-6">
                    <button 
                      type="button"
                      onClick={() => setFormData(p => ({...p, bathrooms: Math.max(1, p.bathrooms - 1)}))}
                      className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center hover:border-primary transition-colors"
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <span className="text-3xl font-bold text-dark min-w-[40px] text-center">{formData.bathrooms}</span>
                    <button 
                      type="button"
                      onClick={() => setFormData(p => ({...p, bathrooms: p.bathrooms + 1}))}
                      className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center hover:border-primary transition-colors"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-8">
                <label className="block font-semibold text-dark mb-6">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {AMENITIES.map((amenity) => (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all ${
                        formData.amenities.includes(amenity.id)
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-gray-300 text-gray'
                      }`}
                    >
                      <i className={`fas ${amenity.icon} text-lg`}></i>
                      <span className="font-medium">{amenity.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Security Deposit */}
              <div className="mb-8">
                <label className="block font-semibold text-dark mb-4">Security Deposit (Optional)</label>
                <div className="relative max-w-xs">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray">$</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.security_deposit}
                    onChange={(e) => setFormData({...formData, security_deposit: parseInt(e.target.value) || 0})}
                    className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-border rounded-xl focus:outline-none focus:border-primary"
                    placeholder="0"
                  />
                </div>
                <p className="text-sm text-gray mt-2">A security deposit helps ensure property protection</p>
              </div>
            </section>

            {/* House Rules */}
            <section>
              <h3 className="text-2xl font-bold text-dark mb-6 flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <i className="fas fa-clipboard-list text-primary"></i>
                </div>
                House Rules & Expectations
              </h3>
              <textarea
                placeholder="Describe your expectations for house care, any specific rules, maintenance requirements..."
                value={formData.rules}
                onChange={(e) => setFormData({...formData, rules: e.target.value})}
                rows={5}
                className="w-full p-4 bg-white border-2 border-border rounded-xl focus:outline-none focus:border-primary resize-none"
              ></textarea>
            </section>

            {/* Additional Links */}
            <section>
              <h3 className="text-2xl font-bold text-dark mb-6 flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <i className="fas fa-link text-primary"></i>
                </div>
                Additional Information
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Property Website (Optional)</label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                    placeholder="https://www.myproperty.com"
                    className="w-full p-3.5 bg-white border-2 border-border rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Virtual Tour Link (Optional)</label>
                  <input
                    type="url"
                    value={formData.virtual_tour_url}
                    onChange={(e) => setFormData({...formData, virtual_tour_url: e.target.value})}
                    placeholder="https://www.matterport.com/tour"
                    className="w-full p-3.5 bg-white border-2 border-border rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </section>

            {/* Submit */}
            <div className="pt-8 border-t border-border">
              <div className="bg-primary/5 rounded-2xl p-6 mb-8">
                <div className="flex items-center mb-4">
                  <i className="fas fa-shield-alt text-primary text-xl mr-3"></i>
                  <h4 className="font-bold text-dark">Your listing will be verified</h4>
                </div>
                <p className="text-gray text-sm">
                  All property listings undergo verification to ensure accuracy and maintain trust within our community.
                  You'll be notified via WhatsApp once your listing is approved.
                </p>
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className={`w-full bg-primary text-white py-4 rounded-xl text-xl font-bold shadow-lg transition-colors flex items-center justify-center ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-hover'
                }`}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Submitting...
                  </>
                ) : (
                  'List My Property'
                )}
              </button>
              
              <p className="text-center text-gray text-sm mt-6">
                By listing your property, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};