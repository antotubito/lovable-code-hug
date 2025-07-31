import Fuse from 'fuse.js';
import { debounce } from './utils';
import { logger } from './logger';
import type { Location } from '../types/location';

// Type for city data with alternate names
interface CityData extends Location {
  alternateNames?: Record<string, string>;
  population?: number;
}

// Cache for search results
const searchCache = new Map<string, Location[]>();

// Initialize Fuse.js for fuzzy search
let fuseInstance: Fuse<CityData> | null = null;
let citiesData: { cities: CityData[] } = { cities: [] };

// Initialize cities data
const initCitiesData = async () => {
  try {
    // Try to import the cities data
    const module = await import('../data/cities.json');
    citiesData = module.default;
    return citiesData.cities;
  } catch (error) {
    logger.error('Error loading cities data:', error);
    // Fallback to empty array
    return [];
  }
};

// Initialize Fuse.js instance
const initFuse = async () => {
  if (fuseInstance) return fuseInstance;
  
  try {
    // Get cities from the imported JSON file
    const cities = await initCitiesData();
    
    // Configure Fuse.js for fuzzy search
    fuseInstance = new Fuse(cities, {
      keys: ['name', 'country', 'region', 'alternateNames'],
      threshold: 0.3, // Lower threshold means more strict matching
      distance: 100, // How far to search for matches
      includeScore: true, // Include match score in results
      shouldSort: true, // Sort by best match
      minMatchCharLength: 2, // Minimum characters that must match
      ignoreLocation: true, // Ignore where in the string the match occurs
    });
    
    return fuseInstance;
  } catch (error) {
    logger.error('Error initializing Fuse.js:', error);
    return null;
  }
};

// Search cities with fuzzy matching
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
    
    // Initialize Fuse.js if needed
    const fuse = await initFuse();
    if (!fuse) {
      logger.error('Fuse.js not initialized');
      return [];
    }
    
    // Perform search
    const searchResults = fuse.search(query);
    
    // Process results
    const locations = searchResults
      .slice(0, limit)
      .map(result => {
        const city = result.item;
        
        // Get localized name if available
        let localizedName = city.name;
        if (language !== 'en' && city.alternateNames && city.alternateNames[language]) {
          localizedName = city.alternateNames[language];
        }
        
        return {
          id: city.id,
          name: city.name,
          country: city.country,
          countryCode: city.countryCode,
          region: city.region,
          latitude: city.latitude,
          longitude: city.longitude,
          population: city.population,
          localizedName: localizedName !== city.name ? localizedName : undefined,
          // Format for select component
          label: `${city.name}, ${city.country}`,
          value: city.name
        };
      });
    
    // Cache results
    searchCache.set(cacheKey, locations);
    
    return locations;
  } catch (error) {
    logger.error('Error searching cities:', error);
    return [];
  }
};

// Create debounced version of searchCities
export const debouncedSearchCities = debounce(searchCities, 300);

// Get all cities (for testing or initial data)
export const getAllCities = async (): Promise<Location[]> => {
  const cities = await initCitiesData();
  return cities.map(city => ({
    id: city.id,
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
};

// Get popular cities for initial suggestions
export const getPopularCities = (limit: number = 10): Location[] => {
  // Fallback popular cities if data isn't loaded yet
  const fallbackCities: Location[] = [
    { id: 'nyc', name: 'New York', country: 'United States', countryCode: 'US', region: 'New York', latitude: 40.7128, longitude: -74.0060 },
    { id: 'london', name: 'London', country: 'United Kingdom', countryCode: 'GB', region: 'England', latitude: 51.5074, longitude: -0.1278 },
    { id: 'paris', name: 'Paris', country: 'France', countryCode: 'FR', region: 'Île-de-France', latitude: 48.8566, longitude: 2.3522 },
    { id: 'tokyo', name: 'Tokyo', country: 'Japan', countryCode: 'JP', region: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
    { id: 'sydney', name: 'Sydney', country: 'Australia', countryCode: 'AU', region: 'New South Wales', latitude: -33.8688, longitude: 151.2093 },
    { id: 'berlin', name: 'Berlin', country: 'Germany', countryCode: 'DE', region: 'Berlin', latitude: 52.5200, longitude: 13.4050 },
    { id: 'singapore', name: 'Singapore', country: 'Singapore', countryCode: 'SG', region: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
    { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', region: 'Dubai', latitude: 25.2048, longitude: 55.2708 }
  ];

  if (!citiesData.cities || citiesData.cities.length === 0) {
    return fallbackCities.slice(0, limit);
  }

  return citiesData.cities
    .sort((a, b) => (b.population || 0) - (a.population || 0))
    .slice(0, limit)
    .map(city => ({
      id: city.id,
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
};

// Get cities by country code
export const getCitiesByCountry = (countryCode: string, limit: number = 20): Location[] => {
  if (!citiesData.cities || citiesData.cities.length === 0) {
    return [];
  }

  return citiesData.cities
    .filter(city => city.countryCode.toLowerCase() === countryCode.toLowerCase())
    .sort((a, b) => (b.population || 0) - (a.population || 0))
    .slice(0, limit)
    .map(city => ({
      id: city.id,
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
};

// Get Italian cities specifically
export const getItalianCities = (limit: number = 20): Location[] => {
  return getCitiesByCountry('IT', limit);
};