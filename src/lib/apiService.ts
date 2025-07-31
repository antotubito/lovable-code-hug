import { logger } from './logger';

// Base URL for Supabase Edge Functions
const getEdgeFunctionBaseUrl = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return {
    url: `${supabaseUrl}/functions/v1`,
    key: supabaseAnonKey
  };
};

// Implement request throttling to prevent abuse
const requestThrottles = new Map<string, number>();
const failedRequests = new Map<string, { count: number; lastAttempt: number }>();
const RATE_LIMIT_RESET_TIME = 5 * 60 * 1000; // 5 minutes
const MAX_RETRY_ATTEMPTS = 3;

// Function to check if a request should be throttled
function shouldThrottle(key: string, minIntervalMs: number = 1000): boolean {
  const now = Date.now();
  const lastRequest = requestThrottles.get(key) || 0;
  
  // Check failed requests
  const failedRequest = failedRequests.get(key);
  if (failedRequest) {
    if (now - failedRequest.lastAttempt > RATE_LIMIT_RESET_TIME) {
      // Reset after cooldown period
      failedRequests.delete(key);
    } else if (failedRequest.count >= MAX_RETRY_ATTEMPTS) {
      return true;
    }
  }
  
  if (now - lastRequest < minIntervalMs) {
    return true;
  }
  
  requestThrottles.set(key, now);
  return false;
}

// Function to handle failed requests
function handleFailedRequest(key: string) {
  const now = Date.now();
  const failed = failedRequests.get(key) || { count: 0, lastAttempt: now };
  failed.count++;
  failed.lastAttempt = now;
  failedRequests.set(key, failed);
}

// Function to calculate exponential backoff delay
function getBackoffDelay(retryCount: number): number {
  return Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
}

// Validate API keys
const GEODB_API_KEY = "f4b0b7ef11msh663d761ebea1d2fp15c6eajsnbb69d673cce0";

if (!GEODB_API_KEY) {
  logger.error('Missing GeoDB API key. Please check your environment variables.');
}

// GeoDB Cities API credentials
const GEODB_API_HOST = 'wft-geo-db.p.rapidapi.com';

// Generic API service that uses Edge Functions to proxy requests
export const apiService = {
  // Location services
  locations: {
    // Search for locations by query using GeoDB Cities API
    async search(query: string, language: string = 'en'): Promise<{ locations: Location[] }> {
      try {
        // Validate input
        if (!query || query.length < 2) {
          throw new Error('Search query must be at least 2 characters');
        }
        
        // Generate unique key for this search
        const searchKey = `location:search:${query}:${language}`;
        
        // Check throttling with exponential backoff
        if (shouldThrottle(searchKey)) {
          const failed = failedRequests.get(searchKey);
          if (failed) {
            const backoffDelay = getBackoffDelay(failed.count);
            throw new Error(`Too many requests. Please wait ${Math.ceil(backoffDelay / 1000)} seconds before trying again.`);
          }
          throw new Error('Please wait a moment before searching again.');
        }
        
        // Try GeoDB Cities API first (more comprehensive city database)
        try {
          if (!GEODB_API_KEY) {
            throw new Error('GeoDB API key not configured');
          }
          
          // Call GeoDB Cities API with improved parameters
          const response = await fetch(
            `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(query)}&limit=50&sort=-population`,
            {
              headers: {
                'X-RapidAPI-Key': GEODB_API_KEY,
                'X-RapidAPI-Host': GEODB_API_HOST
              }
            }
          );
          
          if (!response.ok) {
            if (response.status === 429) {
              handleFailedRequest(searchKey);
              throw new Error('Rate limit exceeded. Using alternative data source.');
            }
            if (response.status === 401 || response.status === 403) {
              logger.error('GeoDB API authentication failed. Using alternative data source.');
              throw new Error('Authentication failed. Using alternative data source.');
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              `Failed to search cities: ${response.status} ${response.statusText}` +
              (errorData.message ? ` - ${errorData.message}` : '')
            );
          }
          
          const data = await response.json();
          
          // Check if we got any results
          if (!data.data || data.data.length === 0) {
            // If no results from GeoDB, fall back to fallback data
            throw new Error('No results from GeoDB API');
          }
          
          // Transform GeoDB results to our Location format
          const locations = data.data.map((city: any) => ({
            id: `geodb-${city.id}`,
            name: city.name,
            country: city.country,
            countryCode: city.countryCode,
            region: city.region,
            latitude: city.latitude,
            longitude: city.longitude,
            population: city.population,
            label: `${city.name}, ${city.country}`,
            value: city.name
          }));
          
          // Reset failed request count on success
          failedRequests.delete(searchKey);
          
          return { locations };
        } catch (geoDbError) {
          logger.error('GeoDB Cities API error:', geoDbError);
          
          // Use fallback data when GeoDB fails
          return { locations: getFallbackLocations(query) };
        }
      } catch (error) {
        logger.error('Location search failed:', error);
        return { locations: getFallbackLocations(query) };
      }
    },
    
    // Get nearby places
    async nearby(latitude: number, longitude: number, radius: number = 1000, type?: string): Promise<{ places: any[] }> {
      try {
        // Validate coordinates
        if (isNaN(latitude) || isNaN(longitude) || 
            latitude < -90 || latitude > 90 || 
            longitude < -180 || longitude > 180) {
          throw new Error('Invalid coordinates');
        }
        
        // Generate unique key for this search
        const searchKey = `location:nearby:${latitude},${longitude}:${radius}`;
        
        // Check throttling
        if (shouldThrottle(searchKey, 2000)) { // Longer interval for nearby searches
          throw new Error('Please wait a moment before searching again.');
        }
        
        // Use Nominatim reverse geocoding with a radius parameter
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=amenity:${type || '*'}&limit=15&addressdetails=1&lat=${latitude}&lon=${longitude}&radius=${radius}`,
          {
            headers: {
              'User-Agent': 'Dislink Location Service'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to get nearby places: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Transform the response to match our expected format
        const places = data.map((place: any) => ({
          id: place.place_id,
          name: place.name || place.display_name.split(',')[0],
          address: place.display_name,
          types: [place.type, place.class].filter(Boolean),
          latitude: parseFloat(place.lat),
          longitude: parseFloat(place.lon)
        }));
        
        return { places };
      } catch (error) {
        logger.error('Error getting nearby places:', error);
        
        // Return mock data as fallback
        return {
          places: [
            {
              id: 'mock-1',
              name: 'Nearby Location 1',
              address: 'Address 1',
              types: ['restaurant'],
              latitude: latitude + 0.001,
              longitude: longitude + 0.001
            },
            {
              id: 'mock-2',
              name: 'Nearby Location 2',
              address: 'Address 2',
              types: ['cafe'],
              latitude: latitude - 0.001,
              longitude: longitude + 0.002
            },
            {
              id: 'mock-3',
              name: 'Nearby Location 3',
              address: 'Address 3',
              types: ['store'],
              latitude: latitude + 0.002,
              longitude: longitude - 0.001
            }
          ]
        };
      }
    }
  }
};

// Fallback function that returns filtered cities when APIs fail
function getFallbackLocations(query: string): Location[] {
  // A comprehensive list of major world cities
  const FALLBACK_CITIES: Location[] = [
    // North America
    { id: 'nyc', name: 'New York', country: 'United States', countryCode: 'US', region: 'New York', latitude: 40.7128, longitude: -74.0060 },
    { id: 'la', name: 'Los Angeles', country: 'United States', countryCode: 'US', region: 'California', latitude: 34.0522, longitude: -118.2437 },
    { id: 'chicago', name: 'Chicago', country: 'United States', countryCode: 'US', region: 'Illinois', latitude: 41.8781, longitude: -87.6298 },
    { id: 'toronto', name: 'Toronto', country: 'Canada', countryCode: 'CA', region: 'Ontario', latitude: 43.6532, longitude: -79.3832 },
    { id: 'mexico-city', name: 'Mexico City', country: 'Mexico', countryCode: 'MX', region: 'CDMX', latitude: 19.4326, longitude: -99.1332 },
    
    // Europe
    { id: 'london', name: 'London', country: 'United Kingdom', countryCode: 'GB', region: 'England', latitude: 51.5074, longitude: -0.1278 },
    { id: 'paris', name: 'Paris', country: 'France', countryCode: 'FR', region: 'Île-de-France', latitude: 48.8566, longitude: 2.3522 },
    { id: 'berlin', name: 'Berlin', country: 'Germany', countryCode: 'DE', region: 'Berlin', latitude: 52.5200, longitude: 13.4050 },
    { id: 'rome', name: 'Rome', country: 'Italy', countryCode: 'IT', region: 'Lazio', latitude: 41.9028, longitude: 12.4964 },
    { id: 'madrid', name: 'Madrid', country: 'Spain', countryCode: 'ES', region: 'Madrid', latitude: 40.4168, longitude: -3.7038 },
    { id: 'amsterdam', name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', region: 'North Holland', latitude: 52.3676, longitude: 4.9041 },
    
    // Asia
    { id: 'tokyo', name: 'Tokyo', country: 'Japan', countryCode: 'JP', region: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
    { id: 'shanghai', name: 'Shanghai', country: 'China', countryCode: 'CN', region: 'Shanghai', latitude: 31.2304, longitude: 121.4737 },
    { id: 'delhi', name: 'New Delhi', country: 'India', countryCode: 'IN', region: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
    { id: 'singapore', name: 'Singapore', country: 'Singapore', countryCode: 'SG', region: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
    { id: 'seoul', name: 'Seoul', country: 'South Korea', countryCode: 'KR', region: 'Seoul', latitude: 37.5665, longitude: 126.9780 },
    { id: 'bangkok', name: 'Bangkok', country: 'Thailand', countryCode: 'TH', region: 'Bangkok', latitude: 13.7563, longitude: 100.5018 },
    
    // More major cities...
  ];

  // Filter cities based on query
  const searchTerm = query.toLowerCase();
  return FALLBACK_CITIES.filter(city => 
    city.name.toLowerCase().includes(searchTerm) ||
    city.country.toLowerCase().includes(searchTerm) ||
    city.region.toLowerCase().includes(searchTerm)
  );
}