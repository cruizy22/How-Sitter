// Add these constants to your existing constants file
export const COUNTRIES = [
  'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Philippines',
  'Vietnam', 'Australia', 'New Zealand', 'Japan', 'South Korea',
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
  'Spain', 'Italy', 'Portugal', 'Netherlands', 'Switzerland'
];

export const PROPERTY_TYPES = [
  'Apartment', 'House', 'Villa', 'Condo', 'Townhouse',
  'Cottage', 'Farmhouse', 'Penthouse', 'Studio', 'Loft'
];
// constants.ts
export const AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: 'fa-wifi' },
  { id: 'parking', label: 'Parking', icon: 'fa-parking' },
  { id: 'pool', label: 'Pool', icon: 'fa-swimming-pool' },
  { id: 'gym', label: 'Gym', icon: 'fa-dumbbell' },
  { id: 'ac', label: 'Air Conditioning', icon: 'fa-snowflake' },
  { id: 'heating', label: 'Heating', icon: 'fa-thermometer-half' },
  { id: 'kitchen', label: 'Kitchen', icon: 'fa-utensils' },
  { id: 'washer', label: 'Washer', icon: 'fa-soap' },
  { id: 'dryer', label: 'Dryer', icon: 'fa-wind' },
  { id: 'tv', label: 'TV', icon: 'fa-tv' },
  { id: 'garden', label: 'Garden', icon: 'fa-tree' },
  { id: 'bbq', label: 'BBQ Area', icon: 'fa-fire' },
  { id: 'security', label: 'Security', icon: 'fa-shield-alt' },
  { id: 'elevator', label: 'Elevator', icon: 'fa-elevator' },
  { id: 'balcony', label: 'Balcony', icon: 'fa-building' },
];

export const DURATION_OPTIONS = [
  { value: 30, label: '1 month' },
  { value: 60, label: '2 months' },
  { value: 90, label: '3 months' },
  { value: 180, label: '6 months' },
  { value: 365, label: '1 year' },
];

export const FAQS = [
  {
    question: 'How does trust-based house sitting work?',
    answer: 'Homeowners list their properties for specific dates, and verified sitters apply to stay. Both parties review profiles, communicate via our platform, and agree on terms. The sitter lives in and cares for the property while the homeowner is away.'
  },
  {
    question: 'Is there any cost for homeowners?',
    answer: 'Listing your property is completely free. You only need to cover basic utilities during the sitter\'s stay. No agency fees or commissions.'
  },
  {
    question: 'How are sitters verified?',
    answer: 'All sitters undergo identity verification, background checks where applicable, and must provide references. We also verify their previous house sitting experience and reviews.'
  },
  {
    question: 'What happens if something goes wrong?',
    answer: 'We provide legal agreement templates and 24/7 support. In case of issues, we have a mediation process and can help arrange alternative accommodations if needed.'
  },
  {
    question: 'Can I meet the sitter before agreeing?',
    answer: 'Yes! We encourage video calls before finalizing any arrangement. You can discuss expectations, house rules, and get to know each other virtually.'
  }
];

export const TRAVEL_STATS = [
  { country: 'United States', flag: '🇺🇸', percentage: 35, duration: '2-4 weeks avg' },
  { country: 'United Kingdom', flag: '🇬🇧', percentage: 25, duration: '3-6 weeks avg' },
  { country: 'Australia', flag: '🇦🇺', percentage: 20, duration: '1-3 months avg' },
  { country: 'Spain', flag: '🇪🇸', percentage: 15, duration: '2-4 weeks avg' },
  { country: 'Japan', flag: '🇯🇵', percentage: 5, duration: '2-3 weeks avg' }
];