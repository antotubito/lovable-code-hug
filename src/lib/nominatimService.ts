import { debounce } from './utils';
import { logger } from './logger';
import type { Location } from '../types/location';
import { searchCities as searchLocalCities, getPopularCities as getLocalPopularCities } from './citiesService';

// Cache for search results
const searchCache = new Map<string, Location[]>();

// Rate limiting for Nominatim API (1 request per second)
let lastNominatimRequest = 0;
const NOMINATIM_RATE_LIMIT = 1000; // 1 second in milliseconds

// Track API failures to switch to local data
let apiFailureCount = 0;
const MAX_API_FAILURES = 3;
let lastApiAttemptTime = 0;
const API_FAILURE_RESET_TIME = 5 * 60 * 1000; // 5 minutes

// Language mapping for common cities (English name to local name)
const CITY_LANGUAGE_MAPPING: Record<string, Record<string, string>> = {
  'it': { // Italian
    'Florence': 'Firenze',
    'Rome': 'Roma',
    'Milan': 'Milano',
    'Venice': 'Venezia',
    'Naples': 'Napoli'
  },
  'es': { // Spanish
    'Seville': 'Sevilla',
    'Barcelona': 'Barcelona',
    'Madrid': 'Madrid'
  },
  'fr': { // French
    'Marseille': 'Marseille',
    'Lyon': 'Lyon',
    'Paris': 'Paris'
  },
  'de': { // German
    'Munich': 'München',
    'Cologne': 'Köln',
    'Berlin': 'Berlin'
  },
  'ja': { // Japanese
    'Tokyo': '東京',
    'Osaka': '大阪',
    'Kyoto': '京都'
  }
};

// Check if we should use local data instead of API
const shouldUseLocalData = (): boolean => {
  // Check if we're offline
  if (typeof navigator !== 'undefined' && 'onLine' in navigator && !navigator.onLine) {
    logger.info('Using local city data because device is offline');
    return true;
  }
  
  // Check if we've had too many API failures recently
  const now = Date.now();
  if (now - lastApiAttemptTime > API_FAILURE_RESET_TIME) {
    // Reset failure count after reset time
    apiFailureCount = 0;
    return false;
  }
  
  if (apiFailureCount >= MAX_API_FAILURES) {
    logger.info(`Using local city data due to ${apiFailureCount} recent API failures`);
    return true;
  }
  
  return false;
};

// Get localized city name if available
export const getLocalizedCityName = (cityName: string, language: string): string => {
  // First check the language mapping
  const languageMap = CITY_LANGUAGE_MAPPING[language];
  if (languageMap && languageMap[cityName]) {
    return languageMap[cityName];
  }
  
  // Then check the cities data for alternate names
  const city = citiesData?.cities?.find(c => c.name.toLowerCase() === cityName.toLowerCase());
  if (city?.alternateNames && city.alternateNames[language]) {
    return city.alternateNames[language];
  }
  
  return cityName;
};

// Get English city name from localized name
export const getEnglishCityName = (localizedName: string, language: string): string => {
  // First check the language mapping
  const languageMap = CITY_LANGUAGE_MAPPING[language];
  if (languageMap) {
    const englishName = Object.entries(languageMap).find(
      ([_, locName]) => locName.toLowerCase() === localizedName.toLowerCase()
    );
    if (englishName) return englishName[0];
  }
  
  // Then check the cities data for alternate names
  if (citiesData?.cities) {
    for (const city of citiesData.cities) {
      if (city.alternateNames && city.alternateNames[language]?.toLowerCase() === localizedName.toLowerCase()) {
        return city.name;
      }
    }
  }
  
  return localizedName;
};

// Enforce rate limit for Nominatim API
const enforceRateLimit = async (): Promise<void> => {
  const now = Date.now();
  const timeElapsed = now - lastNominatimRequest;
  
  if (timeElapsed < NOMINATIM_RATE_LIMIT) {
    // Wait for the remaining time to respect the rate limit
    const waitTime = NOMINATIM_RATE_LIMIT - timeElapsed;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  // Update the last request timestamp
  lastNominatimRequest = Date.now();
};

// Search cities using Nominatim API
export const searchCities = async (
  query: string, 
  language: string = 'en',
  limit: number = 50 // Increased limit to show more results
): Promise<Location[]> => {
  try {
    // Validate input
    if (!query || query.length < 2) {
      return [];
    }
    
    // Check cache first
    const cacheKey = `${query.toLowerCase().trim()}-${language}`;
    if (searchCache.has(cacheKey)) {
      return searchCache.get(cacheKey) || [];
    }
    
    // Check if we should use local data
    if (shouldUseLocalData()) {
      logger.info('Using local city data for search');
      const localResults = await searchLocalCities(query, language, limit);
      
      // Cache results
      searchCache.set(cacheKey, localResults);
      
      return localResults;
    }
    
    // Enforce rate limit before making the request
    await enforceRateLimit();
    
    // Update last API attempt time
    lastApiAttemptTime = Date.now();
    
    // Build the Nominatim API URL with improved parameters
    // Using featuretype to focus on cities, towns, and villages
    // viewbox parameter helps prioritize more populated areas
    const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=${limit}&accept-language=${language}&featuretype=city&featuretype=town&featuretype=village&featuretype=hamlet&dedupe=1`;
    
    // Call Nominatim API with proper language header
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Dislink City Search (https://dislink.com)',
        'Accept-Language': language === 'auto' ? navigator.language : language
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to search cities: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Reset API failure count on success
    apiFailureCount = 0;
    
    // Filter results to only include places (cities, towns, villages, hamlets)
    // Improved filtering to prioritize actual cities
    const filteredResults = data
      .filter((place: any) => {
        // Check if it's a place (city, town, village, hamlet)
        const isPlace = place.class === 'place' && 
          ['city', 'town', 'village', 'hamlet', 'suburb', 'municipality'].includes(place.type);
        
        // Check if it has address details
        const hasAddress = place.address && 
          (place.address.city || place.address.town || place.address.village || 
           place.address.hamlet || place.address.municipality);
        
        return isPlace || hasAddress;
      })
      .sort((a: any, b: any) => {
        // Prioritize cities over towns, towns over villages, etc.
        const typeOrder = { city: 1, town: 2, municipality: 3, suburb: 4, village: 5, hamlet: 6 };
        const aType = a.type || 'other';
        const bType = b.type || 'other';
        return (typeOrder[aType] || 99) - (typeOrder[bType] || 99);
      });
    
    // Transform Nominatim results to our Location format
    const locations = filteredResults.map((place: any) => {
      // Extract country and region from address details
      const country = place.address.country || '';
      const countryCode = place.address.country_code?.toUpperCase() || '';
      const region = place.address.state || place.address.county || '';
      
      // Get the city name - prioritize address components over place name
      const name = place.address.city || 
                   place.address.town || 
                   place.address.village || 
                   place.address.hamlet || 
                   place.address.municipality || 
                   place.name;
      
      // Store both the localized name and the English name
      const localizedName = name;
      const englishName = language !== 'en' ? getEnglishCityName(name, language) : name;
      
      return {
        id: `nominatim-${place.place_id}`,
        name: englishName || name, // Use English name for consistency
        country,
        countryCode,
        region,
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
        // Store the localized name if different from English
        localizedName: localizedName !== englishName ? localizedName : undefined,
        // Store the display name for reference
        displayName: place.display_name,
        // Format for select component
        label: `${name}, ${country}`,
        value: name
      };
    });
    
    // Cache results
    searchCache.set(cacheKey, locations);
    
    return locations;
  } catch (error) {
    logger.error('Error searching cities with Nominatim:', error);
    
    // Increment API failure count
    apiFailureCount++;
    
    // Fall back to local search
    logger.info(`Falling back to local city data after API error (failure count: ${apiFailureCount})`);
    const localResults = await searchLocalCities(query, language, limit);
    
    // Cache results
    searchCache.set(cacheKey, localResults);
    
    return localResults;
  }
};

// Create debounced version of searchCities with 500ms delay
export const debouncedSearchCities = debounce(searchCities, 500);

// Get popular cities filtered by query
export const getPopularCitiesByQuery = (query: string = ''): Location[] => {
  if (!query) return POPULAR_CITIES;
  
  const searchTerm = query.toLowerCase();
  return POPULAR_CITIES.filter(city => 
    city.name.toLowerCase().includes(searchTerm) ||
    city.country.toLowerCase().includes(searchTerm) ||
    (city.region && city.region.toLowerCase().includes(searchTerm))
  );
};

// Get popular cities for initial suggestions
export const getPopularCities = (limit: number = 8): Location[] => {
  // Try to get from local data first if API has been failing
  if (shouldUseLocalData()) {
    return getLocalPopularCities(limit);
  }
  return POPULAR_CITIES.slice(0, limit);
};

// Popular cities for initial suggestions
const POPULAR_CITIES: Location[] = [
  { id: 'nyc', name: 'New York', country: 'United States', countryCode: 'US', region: 'New York', latitude: 40.7128, longitude: -74.0060 },
  { id: 'london', name: 'London', country: 'United Kingdom', countryCode: 'GB', region: 'England', latitude: 51.5074, longitude: -0.1278 },
  { id: 'paris', name: 'Paris', country: 'France', countryCode: 'FR', region: 'Île-de-France', latitude: 48.8566, longitude: 2.3522 },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', countryCode: 'JP', region: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
  { id: 'sydney', name: 'Sydney', country: 'Australia', countryCode: 'AU', region: 'New South Wales', latitude: -33.8688, longitude: 151.2093 },
  { id: 'berlin', name: 'Berlin', country: 'Germany', countryCode: 'DE', region: 'Berlin', latitude: 52.5200, longitude: 13.4050 },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', countryCode: 'SG', region: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', region: 'Dubai', latitude: 25.2048, longitude: 55.2708 }
];

// Import cities data with a fallback
let citiesData: { cities: any[] } = { cities: [] };
try {
  // Try to import the cities data
  import('../data/cities.json').then(module => {
    citiesData = module.default;
  }).catch(err => {
    logger.error('Error loading cities data:', err);
    // Use empty array as fallback
    citiesData = { cities: [] };
  });
} catch (error) {
  logger.error('Error importing cities data:', error);
  // Use empty array as fallback
  citiesData = { cities: [] };
}