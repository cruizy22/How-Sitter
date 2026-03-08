// src/utils/imageUtils.ts

// Reliable fallback image URLs (using picsum which is very reliable)
export const FALLBACK_IMAGES = {
  property: 'https://picsum.photos/800/600?random=1',
  apartment: 'https://picsum.photos/800/600?random=2',
  house: 'https://picsum.photos/800/600?random=3',
  villa: 'https://picsum.photos/800/600?random=4',
  condo: 'https://picsum.photos/800/600?random=5',
  townhouse: 'https://picsum.photos/800/600?random=6',
  avatar: 'https://picsum.photos/200/200?random=7',
};

// Generate a consistent fallback based on property type
export const getPropertyFallbackImage = (type?: string): string => {
  switch (type?.toLowerCase()) {
    case 'apartment':
      return FALLBACK_IMAGES.apartment;
    case 'house':
      return FALLBACK_IMAGES.house;
    case 'villa':
      return FALLBACK_IMAGES.villa;
    case 'condo':
      return FALLBACK_IMAGES.condo;
    case 'townhouse':
      return FALLBACK_IMAGES.townhouse;
    default:
      return FALLBACK_IMAGES.property;
  }
};

// Create a data URL for a simple colored placeholder (no network request)
export const createDataUrlPlaceholder = (text: string, bgColor: string = '009639', textColor: string = 'ffffff'): string => {
  // Create a simple SVG placeholder
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#${bgColor}" />
      <text x="50%" y="50%" font-family="Arial" font-size="20" fill="#${textColor}" text-anchor="middle" dy=".3em">
        ${text}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// Generate a initials avatar
export const getInitialsAvatar = (name: string): string => {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  return createDataUrlPlaceholder(initials, '009639', 'ffffff');
};