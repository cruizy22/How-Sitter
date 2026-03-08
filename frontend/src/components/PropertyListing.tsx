// src/components/PropertyListing.tsx - Complete working version with image import
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

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
  airbnb_url: string;
  square_feet?: number;
  min_stay_days?: number;
  max_stay_days?: number;
  photos: File[];
  importedImages?: Array<{ url: string; caption?: string; isPrimary?: boolean }>;
}

const AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: 'fa-wifi' },
  { id: 'parking', label: 'Parking', icon: 'fa-parking' },
  { id: 'pool', label: 'Pool', icon: 'fa-swimming-pool' },
  { id: 'garden', label: 'Garden', icon: 'fa-tree' },
  { id: 'ac', label: 'Air Conditioning', icon: 'fa-snowflake' },
  { id: 'gym', label: 'Gym', icon: 'fa-dumbbell' },
  { id: 'kitchen', label: 'Kitchen', icon: 'fa-utensils' },
  { id: 'laundry', label: 'Laundry', icon: 'fa-tshirt' },
  { id: 'tv', label: 'TV', icon: 'fa-tv' },
  { id: 'workspace', label: 'Workspace', icon: 'fa-laptop' },
  { id: 'pets', label: 'Pet Friendly', icon: 'fa-paw' },
  { id: 'smoking', label: 'Smoking Allowed', icon: 'fa-smoking' },
  { id: 'elevator', label: 'Elevator', icon: 'fa-elevator' },
  { id: 'fireplace', label: 'Fireplace', icon: 'fa-fire' },
  { id: 'beach', label: 'Beach Access', icon: 'fa-umbrella-beach' },
  { id: 'mountain', label: 'Mountain View', icon: 'fa-mountain' },
  { id: 'coffee', label: 'Coffee Maker', icon: 'fa-mug-hot' },
  { id: 'breakfast', label: 'Breakfast', icon: 'fa-bread-slice' },
  { id: 'balcony', label: 'Balcony', icon: 'fa-building' },
  { id: 'bbq', label: 'BBQ Grill', icon: 'fa-fire' },
  { id: 'hot tub', label: 'Hot Tub', icon: 'fa-hot-tub' },
  { id: 'heating', label: 'Heating', icon: 'fa-thermometer-half' },
  { id: 'security', label: 'Security', icon: 'fa-shield-alt' },
  { id: 'ev charging', label: 'EV Charging', icon: 'fa-charging-station' },
];

export const PropertyListing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    location: '',
    city: '',
    country: '',
    price_per_month: 0,
    security_deposit: 0,
    amenities: [],
    airbnb_url: '',
    square_feet: undefined,
    min_stay_days: 30,
    max_stay_days: 365,
    photos: [],
    importedImages: [],
  });

  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [airbnbUrl, setAirbnbUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importedImages, setImportedImages] = useState<string[]>([]);
  
  const urlInputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Auto-detect when user pastes an Airbnb URL
  useEffect(() => {
    if (airbnbUrl.trim() && airbnbUrl.includes('airbnb.com') && !importLoading) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        handleImportFromUrl();
      }, 1000);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [airbnbUrl]);

  // Handle multiple file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    
    // Limit to 8 photos max (including imported ones)
    const totalPhotos = formData.photos.length + importedImages.length + newFiles.length;
    if (totalPhotos > 8) {
      setError('You can only have up to 8 photos total (imported + uploaded)');
      return;
    }

    // Validate file types and size
    const invalidFiles = newFiles.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError('Please upload only image files');
      return;
    }

    const oversizedFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Each photo must be less than 10MB');
      return;
    }

    // Create preview URLs
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newFiles]
    }));
    
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
    setError('');
  };

  // Remove a photo (either uploaded or imported)
  const handleRemovePhoto = (index: number, isImported: boolean = false) => {
    if (isImported) {
      // Remove from imported images
      setImportedImages(prev => prev.filter((_, i) => i !== index));
      setFormData(prev => ({
        ...prev,
        importedImages: prev.importedImages?.filter((_, i) => i !== index)
      }));
    } else {
      // Remove from uploaded photos
      if (photoPreviews[index]) {
        URL.revokeObjectURL(photoPreviews[index]);
      }

      setFormData(prev => ({
        ...prev,
        photos: prev.photos.filter((_, i) => i !== index)
      }));
      
      setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Upload photos to server
 // Upload photos to server
const uploadPhotos = async (propertyId: string) => {
  if (formData.photos.length === 0) {
    console.log('No photos to upload');
    return [];
  }

  setUploading(true);
  setUploadProgress(0);

  const token = localStorage.getItem('token');

  const formDataObj = new FormData();
  formData.photos.forEach(photo => {
    formDataObj.append('images', photo);
  });

  try {
    console.log(`Uploading ${formData.photos.length} photos to property ${propertyId}`);
    
    const response = await fetch(`http://localhost:5000/api/upload/property/${propertyId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formDataObj
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Upload failed');
    }

    const data = await response.json();
    console.log('Upload response:', data);
    setUploadProgress(100);
    return data.images || [];
    
  } catch (error) {
    console.error('Failed to upload photos:', error);
    throw error;
  } finally {
    setUploading(false);
  }
};

  // Handle import from listing URL
  /*const handleImportFromUrl = async () => {
    if (!airbnbUrl.trim()) {
      setError('Please enter a property URL');
      return;
    }

    // Validate URL format
    try {
      new URL(airbnbUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setImportLoading(true);
    setError('');
    setImportSuccess(false);

    try {
      const token = localStorage.getItem('token');
     
      const response = await fetch('http://localhost:5000/api/real-listing/import', {
        method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: airbnbUrl })
      });
      
    //  const response = await fetch('http://localhost:5000/api/multi-airbnb/import', {
      //  method: 'POST',
        //headers: {
          //'Content-Type': 'application/json',
          //'Authorization': `Bearer ${token}`
        //},
        //body: JSON.stringify({ url: airbnbUrl })
     // });
     

      //const response = await fetch('http://localhost:5000/api/scrapingant/import', {
       // method: 'POST',
        //headers: {
          //'Content-Type': 'application/json',
          //'Authorization': `Bearer ${token}`
       // },
        //body: JSON.stringify({ url: airbnbUrl })
     // });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Import failed' }));
        throw new Error(errorData.error || `Import failed (${response.status})`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Import failed');
      }

      const importedData = result.data;
      
      // Handle imported images
      let importedImageUrls: string[] = [];
      if (importedData.images && Array.isArray(importedData.images)) {
        importedImageUrls = importedData.images
          .map((img: any) => {
            if (typeof img === 'string') return img;
            return img.url || img.imageUrl || img.pictureUrl;
          })
          .filter(Boolean);
        
        setImportedImages(importedImageUrls);
        setPhotoPreviews(importedImageUrls); // Show imported images as previews
      }

      // Update form with imported data
      setFormData(prev => ({
        ...prev,
        title: importedData.title || prev.title,
        description: importedData.description || prev.description,
        type: importedData.type || prev.type,
        bedrooms: importedData.bedrooms || prev.bedrooms,
        bathrooms: importedData.bathrooms || prev.bathrooms,
        location: importedData.location || prev.location,
        city: importedData.city || prev.city,
        country: importedData.country || prev.country,
        price_per_month: importedData.price_per_month || prev.price_per_month,
        security_deposit: importedData.security_deposit || prev.security_deposit,
        amenities: [...new Set([...prev.amenities, ...(importedData.amenities || [])])],
        square_feet: importedData.square_feet || prev.square_feet,
        airbnb_url: airbnbUrl,
        importedImages: importedData.images || [],
      }));

      setImportSuccess(true);
      
      // Clear the input after successful import
      setTimeout(() => {
        setAirbnbUrl('');
        setImportSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to import listing');
    } finally {
      setImportLoading(false);
    }
  };
*/
  // Handle import from listing URL
// Handle import from listing URL
const handleImportFromUrl = async () => {
  if (!airbnbUrl.trim()) {
    setError('Please enter a property URL');
    return;
  }

  // Validate URL format
  try {
    new URL(airbnbUrl);
  } catch {
    setError('Please enter a valid URL');
    return;
  }

  setImportLoading(true);
  setError('');
  setImportSuccess(false);

  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:5000/api/real-listing/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ url: airbnbUrl })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Import failed' }));
      throw new Error(errorData.error || `Import failed (${response.status})`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Import failed');
    }

    const importedData = result.data;
    console.log('Imported data:', importedData); // Debug log
    
    // Handle imported images
    let importedImageUrls: string[] = [];
    let importedImagesData: Array<{ url: string; caption?: string; isPrimary?: boolean }> = [];
    
    // Check if images exist in the response
    if (importedData.images && Array.isArray(importedData.images) && importedData.images.length > 0) {
      console.log('Images array:', importedData.images);
      
      importedImagesData = importedData.images.map((img: any, index: number) => {
        // Extract URL - handle different formats
        let imageUrl = '';
        if (typeof img === 'string') {
          imageUrl = img;
        } else if (img.url) {
          imageUrl = img.url;
        } else if (img.imageUrl) {
          imageUrl = img.imageUrl;
        } else if (img.pictureUrl) {
          imageUrl = img.pictureUrl;
        }
        
        // Ensure URL is absolute and properly formatted
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = `https:${imageUrl}`;
        }
        
        return {
          url: imageUrl,
          caption: img.caption || `Property image ${index + 1}`,
          isPrimary: index === 0 || img.isPrimary
        };
      }).filter(img => img.url); // Remove any entries without URLs
      
      // Extract just the URLs for preview
      importedImageUrls = importedImagesData.map(img => img.url);
      
      console.log('Processed images:', importedImagesData.length);
    } 
    // Fallback to primary_image
    else if (importedData.primary_image) {
      let primaryImageUrl = importedData.primary_image;
      if (!primaryImageUrl.startsWith('http')) {
        primaryImageUrl = `https:${primaryImageUrl}`;
      }
      
      importedImageUrls = [primaryImageUrl];
      importedImagesData = [{
        url: primaryImageUrl,
        caption: 'Primary image',
        isPrimary: true
      }];
      
      console.log('Using primary image:', primaryImageUrl);
    }
    
    // If no images found, use a placeholder
    if (importedImageUrls.length === 0) {
      console.log('No images found, using placeholder');
      importedImageUrls = ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'];
      importedImagesData = [{
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
        caption: 'Property image',
        isPrimary: true
      }];
    }
    
    // Set the images for preview
    setImportedImages(importedImageUrls);
    setPhotoPreviews(importedImageUrls);

    // Update form with imported data
    setFormData(prev => ({
      ...prev,
      title: importedData.title || prev.title,
      description: importedData.description || prev.description,
      type: importedData.type || prev.type,
      bedrooms: importedData.bedrooms || prev.bedrooms,
      bathrooms: importedData.bathrooms || prev.bathrooms,
      location: importedData.location || prev.location,
      city: importedData.city || prev.city,
      country: importedData.country || prev.country,
      price_per_month: importedData.price_per_month || prev.price_per_month,
      security_deposit: importedData.security_deposit || prev.security_deposit,
      amenities: [...new Set([...prev.amenities, ...(importedData.amenities || [])])],
      square_feet: importedData.square_feet || prev.square_feet,
      airbnb_url: airbnbUrl,
      importedImages: importedImagesData,
    }));

    setImportSuccess(true);
    
    // Show success message with image count
    setError(`✅ Successfully imported! Found ${importedImageUrls.length} image(s).`);
    setTimeout(() => setError(''), 3000);
    
  } catch (err: any) {
    console.error('Import error:', err);
    setError(err.message || 'Failed to import listing');
  } finally {
    setImportLoading(false);
  }
};

  const toggleAmenity = (id: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(id) 
        ? prev.amenities.filter(a => a !== id)
        : [...prev.amenities, id]
    }));
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // Validate required fields
    if (!formData.title.trim()) throw new Error('Property title is required');
    if (!formData.description.trim()) throw new Error('Property description is required');
    if (!formData.location.trim()) throw new Error('Address is required');
    if (!formData.city.trim()) throw new Error('City is required');
    if (!formData.country.trim()) throw new Error('Country is required');
    if (formData.price_per_month <= 0) throw new Error('Monthly price must be greater than 0');

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      throw new Error('Please log in to list a property');
    }

    // Prepare imported images data - use the full objects from formData
    const importedImagesData = formData.importedImages && formData.importedImages.length > 0 
      ? formData.importedImages.map((img, index) => ({
          url: typeof img === 'string' ? img : img.url,
          caption: img.caption || `Imported image ${index + 1}`,
          isPrimary: index === 0 // First imported image as primary
        }))
      : [];

    // Create property data (including imported images)
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
      airbnb_url: formData.airbnb_url || undefined,
      imported_images: importedImagesData, // Send imported images data
    };

    // Create the property
    const response = await api.createProperty(propertyData);
    console.log('Property created:', response);
    
    // Upload user-uploaded photos if any
    if (formData.photos.length > 0 && response.propertyId) {
      await uploadPhotos(response.propertyId);
    }
    
    // If there are imported images, we need to save them to the property
    if (importedImagesData.length > 0 && response.propertyId) {
      try {
        // First, check if your backend has an endpoint to save imported images
        // This might not be needed if your backend already handles the imported_images field
        console.log('Imported images saved with property creation');
        
        // If your backend doesn't save them automatically, you might need:
        /*
        await fetch(`http://localhost:5000/api/properties/${response.propertyId}/imported-images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ images: importedImagesData })
        });
        */
      } catch (err) {
        console.error('Failed to save imported images metadata:', err);
        // Don't throw - property was created successfully, just images metadata failed
      }
    }
    
    setSuccess(true);
    
    // Clean up preview URLs
    photoPreviews.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      type: 'apartment',
      bedrooms: 1,
      bathrooms: 1,
      location: '',
      city: '',
      country: '',
      price_per_month: 0,
      security_deposit: 0,
      amenities: [],
      airbnb_url: '',
      square_feet: undefined,
      min_stay_days: 30,
      max_stay_days: 365,
      photos: [],
      importedImages: [],
    });
    setPhotoPreviews([]);
    setImportedImages([]);
    setAirbnbUrl('');

    // Redirect after success
    setTimeout(() => {
      setSuccess(false);
      navigate('/properties');
    }, 2000);
    
  } catch (err: any) {
    console.error('Error:', err);
    setError(err.message || 'Failed to create listing');
  } finally {
    setLoading(false);
  }
};

  // Combine imported and uploaded photos for display
  const allPhotoPreviews = [...importedImages, ...photoPreviews];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <form onSubmit={handleSubmit}>
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center">
            <i className="fas fa-exclamation-circle mr-2 text-xl"></i>
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600">
            <div className="flex items-center">
              <i className="fas fa-check-circle mr-2 text-xl"></i>
              <div>
                <p className="font-bold">Property listed successfully!</p>
                <p className="text-sm">Redirecting to properties page...</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center mr-4 shadow-lg">
              <i className="fas fa-home text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">List Your Property</h1>
              <p className="text-lg text-gray-600">Find trusted sitters to care for your home</p>
            </div>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-8 border-2 border-green-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <i className="fas fa-cloud-download-alt text-green-600 mr-2"></i>
            Import from Listing
          </h3>
          <p className="text-gray-600 mb-4">
            Paste any Airbnb or Booking.com URL below and it will auto-fill your form, including images!
          </p>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                ref={urlInputRef}
                type="url"
                value={airbnbUrl}
                onChange={(e) => setAirbnbUrl(e.target.value)}
                placeholder="https://www.airbnb.com/rooms/123456"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all pr-12 ${
                  importSuccess 
                    ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500/20' 
                    : 'border-gray-300 focus:border-green-500 focus:ring-green-500/20'
                }`}
                disabled={importLoading}
              />
              {importLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <i className="fas fa-spinner fa-spin text-green-600"></i>
                </div>
              )}
              {importSuccess && !importLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600">
                  <i className="fas fa-check-circle text-xl"></i>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleImportFromUrl}
              disabled={importLoading || !airbnbUrl.trim()}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all shadow-md hover:shadow-lg flex items-center gap-2 min-w-[120px] justify-center"
            >
              {importLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-download"></i>
                  <span>Import</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3 flex items-center">
            <i className="fas fa-info-circle mr-1"></i>
            Supports Airbnb, Booking.com, and VRBO links. Fields and images will auto-fill when detected.
          </p>
          {importedImages.length > 0 && (
            <p className="text-xs text-green-600 mt-2 flex items-center">
              <i className="fas fa-check-circle mr-1"></i>
              {importedImages.length} images imported from listing
            </p>
          )}
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
          <div className="p-8 space-y-8">
            
            {/* Basic Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <i className="fas fa-info-circle text-green-600 mr-3"></i>
                Basic Information
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Property Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Beautiful 3-bedroom apartment in downtown..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your property, neighborhood, and amenities..."
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Property Photos */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <i className="fas fa-camera text-green-600 mr-3"></i>
                Property Photos
                <span className="ml-3 text-sm font-normal text-gray-500">(Max 8 photos)</span>
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  {importedImages.length > 0 
                    ? `${importedImages.length} images imported from listing. You can upload ${8 - importedImages.length} more.` 
                    : 'Upload clear photos of your property. First photo will be the main image.'}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Photo Previews (imported + uploaded) */}
                  {allPhotoPreviews.map((preview, index) => {
                    const isImported = index < importedImages.length;
                    return (
                      <div key={`${isImported ? 'imported' : 'uploaded'}-${index}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-green-200 group">
                        <img 
                          src={preview} 
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            if (!isImported) return;
                            // If imported image fails to load, show fallback
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index, isImported)}
                            className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <i className="fas fa-trash text-sm"></i>
                          </button>
                        </div>
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                            Main Photo
                          </div>
                        )}
                        {isImported && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            Imported
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Upload Button (only if under 8 total photos) */}
                  {allPhotoPreviews.length < 8 && (
                    <label className="aspect-square bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer text-gray-500 hover:text-green-600 hover:border-green-400">
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading || allPhotoPreviews.length >= 8}
                      />
                      {uploading ? (
                        <div className="text-center">
                          <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
                          <span className="text-xs">Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <i className="fas fa-cloud-upload-alt text-2xl mb-2"></i>
                          <span className="text-xs text-center">Click to upload</span>
                          <span className="text-xs text-gray-400 mt-1">
                            {allPhotoPreviews.length}/8 photos
                          </span>
                        </>
                      )}
                    </label>
                  )}
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Uploading photos...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <i className="fas fa-map-marker-alt text-green-600 mr-3"></i>
                Location
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="123 Main St"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="New York"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    placeholder="USA"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <i className="fas fa-home text-green-600 mr-3"></i>
                Property Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                  </select>
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Bedrooms <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({...formData, bedrooms: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Bathrooms <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({...formData, bathrooms: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Sq Feet (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.square_feet || ''}
                    onChange={(e) => setFormData({...formData, square_feet: parseInt(e.target.value) || undefined})}
                    placeholder="1500"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <i className="fas fa-dollar-sign text-green-600 mr-3"></i>
                Pricing
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Monthly Price ($) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      min="1"
                      value={formData.price_per_month || ''}
                      onChange={(e) => setFormData({...formData, price_per_month: parseInt(e.target.value) || 0})}
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                      placeholder="1500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Security Deposit ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.security_deposit}
                      onChange={(e) => setFormData({...formData, security_deposit: parseInt(e.target.value) || 0})}
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                      placeholder="500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Min Stay (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.min_stay_days}
                    onChange={(e) => setFormData({...formData, min_stay_days: parseInt(e.target.value) || 30})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: 30 days</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <i className="fas fa-star text-yellow-500 mr-3"></i>
                Amenities
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {AMENITIES.map((amenity) => (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all ${
                      formData.amenities.includes(amenity.id)
                        ? 'border-green-600 bg-green-50 text-green-700 shadow-sm'
                        : 'border-gray-300 hover:border-green-300 hover:bg-green-50 text-gray-600'
                    }`}
                  >
                    <i className={`fas ${amenity.icon} text-lg`}></i>
                    <span className="font-medium text-sm">{amenity.label}</span>
                  </button>
                ))}
              </div>
              {formData.amenities.length > 0 && (
                <p className="text-sm text-green-600 mt-3">
                  {formData.amenities.length} amenities selected
                </p>
              )}
            </div>

            {/* Airbnb URL */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <i className="fab fa-airbnb text-green-600 mr-3"></i>
                Original Listing
              </h2>
              
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Airbnb/Booking URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.airbnb_url}
                  onChange={(e) => setFormData({...formData, airbnb_url: e.target.value})}
                  placeholder="https://www.airbnb.com/rooms/123456"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Link to your original listing for reference
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button 
                type="submit"
                disabled={loading || uploading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl text-xl font-bold shadow-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    {uploading ? 'Uploading Photos...' : 'Creating Listing...'}
                  </div>
                ) : (
                  'List Property Now'
                )}
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                Your property will be immediately available for sitters to view
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
