import React, { useState, useEffect, useRef, useCallback } from 'react';
import AsyncSelect from 'react-select/async';
import { MapPin, X, Loader2, AlertCircle, Globe, ChevronDown, Clock, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Location } from '../../types/location';
import { logger } from '../../lib/logger';
import { useAuth } from '../auth/AuthProvider';
import { searchCities, debouncedSearchCities, getPopularCities, getLocalizedCityName, getEnglishCityName } from '../../lib/nominatimService';

interface CityAutocompleteProps {
  value: string;
  onSelect: (city: { name: string; location: Location | null }) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  onBlur?: () => void;
  className?: string;
  defaultLanguage?: string;
  language?: string; // Override browser language
  showLanguageIndicator?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  initialSuggestions?: Location[];
  noOptionsMessage?: string;
  loadingMessage?: string;
  storageKey?: string; // Key for localStorage persistence
  fieldName?: string; // Field name for Supabase profile persistence
  showRecentSearches?: boolean; // Whether to show recent searches below the input
  maxRecentSearches?: number; // Maximum number of recent searches to show
}

// Cache for recent searches to improve performance
const searchCache = new Map<string, Location[]>();

export function CityAutocomplete({
  value,
  onSelect,
  label,
  placeholder = "Search for a city...",
  required = false,
  onBlur,
  className = "",
  defaultLanguage = "en",
  language,
  showLanguageIndicator = true,
  errorMessage,
  disabled = false,
  initialSuggestions,
  noOptionsMessage = "No locations found",
  loadingMessage = "Searching locations...",
  storageKey = "userCity",
  fieldName = "location",
  showRecentSearches = true,
  maxRecentSearches = 10
}: CityAutocompleteProps) {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<Location[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [userLanguage, setUserLanguage] = useState<string>(defaultLanguage);
  const [savedLocations, setSavedLocations] = useState<Record<string, Location>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const [allResults, setAllResults] = useState<Location[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastSearchTerm, setLastSearchTerm] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [showRecentPanel, setShowRecentPanel] = useState(false);
  
  const selectRef = useRef<any>(null);
  const resultsPerPage = 50; // Increased from 10 to 50 for more results

  // Detect user's browser language on mount if no language override is provided
  useEffect(() => {
    if (language) {
      setUserLanguage(language);
      return;
    }
    
    try {
      const browserLang = navigator.language || (navigator as any).userLanguage;
      const langCode = browserLang.split('-')[0].toLowerCase();
      setUserLanguage(langCode);
      
      logger.info(`Detected user language: ${langCode}`);
    } catch (err) {
      logger.error('Error detecting user language:', err);
      setUserLanguage(defaultLanguage);
    }
  }, [language, defaultLanguage]);

  // Check online status and set up listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      logger.info('Device is online, using Nominatim API');
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      logger.info('Device is offline, using local city data');
    };
    
    // Set initial state
    setIsOffline(!navigator.onLine);
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const savedSearches = localStorage.getItem('recentLocationSearches');
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches).slice(0, maxRecentSearches));
      }
      
      // Load saved locations from localStorage
      const savedLocationsData = localStorage.getItem('savedLocations');
      if (savedLocationsData) {
        setSavedLocations(JSON.parse(savedLocationsData));
      }
    } catch (err) {
      logger.error('Error loading saved data:', err);
    }
  }, [maxRecentSearches]);

  // Load saved location for this specific field
  useEffect(() => {
    // Try to load from localStorage first
    try {
      const specificLocationKey = `${storageKey}_${fieldName}`;
      const savedLocation = localStorage.getItem(specificLocationKey);
      
      if (savedLocation && !value) {
        const locationData = JSON.parse(savedLocation);
        const formattedLocation = `${locationData.name}${locationData.country ? `, ${locationData.country}` : ''}`;
        
        onSelect({
          name: formattedLocation,
          location: locationData
        });
        
        setSelectedLocation(locationData);
        
        logger.info(`Loaded saved location for ${fieldName} from localStorage:`, locationData);
      }
    } catch (err) {
      logger.error(`Error loading saved location for ${fieldName}:`, err);
    }
  }, [storageKey, fieldName, onSelect, value]);

  // Try to parse the current value into a location object
  useEffect(() => {
    if (value && !selectedLocation) {
      // If we have a value but no selected location, try to extract the city name
      const cityName = value.split(',')[0].trim();
      
      // Check if this city is in our popular cities or recent searches
      const allKnownLocations = [...(initialSuggestions || []), ...recentSearches];
      const matchingLocation = allKnownLocations.find(loc => 
        loc.name.toLowerCase() === cityName.toLowerCase()
      );
      
      if (matchingLocation) {
        setSelectedLocation(matchingLocation);
      }
    }
  }, [value, selectedLocation, recentSearches, initialSuggestions]);

  // Save a location to recent searches
  const saveToRecentSearches = (location: Location) => {
    try {
      // Add to state
      setRecentSearches(prev => {
        // Remove duplicates and add to beginning
        const filtered = prev.filter(item => item.id !== location.id);
        const updated = [location, ...filtered].slice(0, maxRecentSearches);
        
        // Save to localStorage
        localStorage.setItem('recentLocationSearches', JSON.stringify(updated));
        
        return updated;
      });
    } catch (err) {
      logger.error('Error saving recent search:', err);
    }
  };

  // Handle selecting a recent search
  const handleSelectRecentSearch = (location: Location) => {
    handleChange(location);
    setShowRecentPanel(false);
  };

  // Clear all recent searches
  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentLocationSearches');
  };

  // Save location to localStorage and Supabase if user is logged in
  const saveLocationPreference = async (location: Location) => {
    try {
      // Save to localStorage with specific key for this field
      const specificLocationKey = `${storageKey}_${fieldName}`;
      localStorage.setItem(specificLocationKey, JSON.stringify(location));
      
      // Update saved locations object
      const updatedSavedLocations = {
        ...savedLocations,
        [fieldName]: location
      };
      
      // Save all saved locations
      localStorage.setItem('savedLocations', JSON.stringify(updatedSavedLocations));
      setSavedLocations(updatedSavedLocations);
      
      logger.info(`Saved location for ${fieldName} to localStorage:`, location);
      
      // If user is logged in, update bio in profile
      if (user?.id) {
        // Get current bio
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('bio')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          logger.error('Error fetching profile for location update:', profileError);
          return;
        }
        
        // Format location string
        const locationString = `${location.name}${location.country ? `, ${location.country}` : ''}`;
        
        // Update bio with location
        const currentBio = profile.bio || {};
        const updatedBio = {
          ...currentBio,
          [fieldName]: locationString
        };
        
        // Save to Supabase
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ bio: updatedBio })
          .eq('id', user.id);
        
        if (updateError) {
          logger.error('Error updating profile with location:', updateError);
          return;
        }
        
        logger.info(`Saved location for ${fieldName} to profile bio:`, locationString);
      }
    } catch (err) {
      logger.error(`Error saving location preference for ${fieldName}:`, err);
    }
  };

  // Load more results when scrolling
  const loadMoreResults = async () => {
    if (!lastSearchTerm || isLoadingMore || !hasMoreResults) return;
    
    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      
      // Search for more cities
      const moreResults = await searchCities(
        lastSearchTerm,
        userLanguage,
        resultsPerPage
      );
      
      // Filter out duplicates
      const newResults = moreResults.filter(
        city => !allResults.some(existing => existing.id === city.id)
      );
      
      // Update state with new results
      if (newResults.length > 0) {
        setAllResults(prev => [...prev, ...newResults]);
        setCurrentPage(nextPage);
        setHasMoreResults(newResults.length === resultsPerPage);
      } else {
        setHasMoreResults(false);
      }
      
      // Update cache with combined results
      const cacheKey = `${lastSearchTerm.toLowerCase().trim()}-${userLanguage}`;
      searchCache.set(cacheKey, [...allResults, ...newResults]);
      
    } catch (error) {
      logger.error('Error loading more results:', error);
      setHasMoreResults(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Load options function for AsyncSelect
  const loadOptions = useCallback(async (inputValue: string) => {
    if (!inputValue || inputValue.length < 2) {
      return getPopularCities(8);
    }

    // Reset pagination state when search term changes
    if (inputValue !== lastSearchTerm) {
      setCurrentPage(0);
      setHasMoreResults(true);
      setAllResults([]);
      setLastSearchTerm(inputValue);
    }

    // Check cache first
    const cacheKey = `${inputValue.toLowerCase().trim()}-${userLanguage}`;
    if (searchCache.has(cacheKey)) {
      return searchCache.get(cacheKey) || [];
    }

    setIsLoading(true);
    setError(null);

    try {
      // Search cities using Nominatim with debounce
      const locations = await debouncedSearchCities(inputValue, userLanguage);
      
      // Cache the results
      searchCache.set(cacheKey, locations);
      
      // Update all results for pagination
      setAllResults(locations);
      
      // Set has more results flag
      setHasMoreResults(locations.length >= resultsPerPage);
      
      return locations;
    } catch (err) {
      logger.error('Error searching cities:', err);
      setError('Failed to search cities');
      return getPopularCities(8);
    } finally {
      setIsLoading(false);
    }
  }, [userLanguage, lastSearchTerm, currentPage]);

  // Format the option label
  const formatOptionLabel = (option: Location) => {
    // Check if we have a localized name stored
    const displayName = option.localizedName || option.name;
    
    // If the name is different from the English name, show both
    const showBothNames = option.localizedName && 
                          option.localizedName !== option.name && 
                          userLanguage !== 'en';
    
    return (
      <div className="flex items-start">
        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <div className="font-medium">
            {displayName}
            {showBothNames && (
              <span className="ml-1 text-gray-500">
                ({option.name})
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {[option.region, option.country].filter(Boolean).join(', ')}
          </div>
        </div>
      </div>
    );
  };

  // Handle selection change
  const handleChange = (selectedOption: Location | null) => {
    if (selectedOption) {
      // Format the location string (always use English name for consistency)
      const formattedLocation = `${selectedOption.name}${selectedOption.country ? `, ${selectedOption.country}` : ''}`;
      
      // Save the selected location
      setSelectedLocation(selectedOption);
      
      // Add to recent searches
      saveToRecentSearches(selectedOption);
      
      // Save location preference to localStorage and Supabase
      saveLocationPreference(selectedOption);
      
      // Clear any errors
      setError(null);
      
      // Call the onSelect callback with the formatted name and location object
      onSelect({
        name: formattedLocation,
        location: selectedOption
      });
      
      console.log('Selected location:', selectedOption);
    } else {
      // Clear the selection
      setSelectedLocation(null);
      
      // Call the onSelect callback with empty values
      onSelect({
        name: '',
        location: null
      });
      
      // Remove saved location
      try {
        const specificLocationKey = `${storageKey}_${fieldName}`;
        localStorage.removeItem(specificLocationKey);
        
        // Update saved locations object
        const updatedSavedLocations = { ...savedLocations };
        delete updatedSavedLocations[fieldName];
        
        // Save updated saved locations
        localStorage.setItem('savedLocations', JSON.stringify(updatedSavedLocations));
        setSavedLocations(updatedSavedLocations);
      } catch (err) {
        logger.error(`Error removing saved location for ${fieldName}:`, err);
      }
    }
  };

  // Handle input change
  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    
    // Clear error if input is valid
    if (newValue.length >= 2 || newValue === '') {
      setError(null);
    } else if (newValue.length > 0 && newValue.length < 2) {
      setError('Please enter at least 2 characters to search');
    }
    
    return newValue;
  };

  // Handle menu scroll for infinite loading
  const handleMenuScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    
    // Load more results when user scrolls near the bottom
    if (scrollBottom < 50 && hasMoreResults && !isLoadingMore && lastSearchTerm) {
      loadMoreResults();
    }
  };

  // Custom styles for react-select
  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderColor: error || errorMessage ? '#FCA5A5' : state.isFocused ? '#6366F1' : '#D1D5DB',
      boxShadow: error || errorMessage
        ? '0 0 0 1px #EF4444' 
        : state.isFocused 
          ? '0 0 0 1px #6366F1' 
          : 'none',
      borderRadius: '0.5rem',
      padding: '1px',
      '&:hover': {
        borderColor: error || errorMessage ? '#FCA5A5' : '#6366F1',
      },
      opacity: disabled ? 0.7 : 1,
      cursor: disabled ? 'not-allowed' : 'default',
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#9CA3AF',
    }),
    input: (base: any) => ({
      ...base,
      padding: '0.25rem 0',
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? '#F3F4F6' : 'white',
      color: '#111827',
      '&:active': {
        backgroundColor: '#E5E7EB',
      },
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 50,
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }),
    menuList: (base: any) => ({
      ...base,
      maxHeight: '300px', // Taller menu to show more results
    }),
    noOptionsMessage: (base: any) => ({
      ...base,
      color: '#6B7280',
    }),
    loadingMessage: (base: any) => ({
      ...base,
      color: '#6B7280',
    }),
  };

  // Custom components for react-select
  const customComponents = {
    DropdownIndicator: () => (
      <div className="px-2">
        <MapPin className="h-5 w-5 text-gray-400" />
      </div>
    ),
    LoadingIndicator: () => (
      <div className="px-2">
        <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
      </div>
    ),
    ClearIndicator: (props: any) => (
      <div 
        className="px-2 cursor-pointer text-gray-400 hover:text-gray-500"
        onClick={props.clearValue}
      >
        <X className="h-5 w-5" />
      </div>
    ),
    NoOptionsMessage: ({ children }: any) => (
      <div className="p-2 text-center text-gray-500">
        {inputValue.length < 2 
          ? 'Type at least 2 characters to search' 
          : children || noOptionsMessage}
      </div>
    ),
    MenuList: (props: any) => (
      <div 
        onScroll={handleMenuScroll}
        className="max-h-[300px] overflow-y-auto"
      >
        {props.children}
        {isLoadingMore && (
          <div className="text-center py-2">
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin mx-auto" />
          </div>
        )}
        {hasMoreResults && !isLoadingMore && lastSearchTerm && (
          <div className="text-center py-2 text-xs text-gray-500">
            Scroll for more results
          </div>
        )}
      </div>
    ),
  };

  // Default options to show when the menu is first opened
  const defaultOptions = [...recentSearches, ...(initialSuggestions || getPopularCities(8)).filter(city => 
    !recentSearches.some(recent => recent.id === city.id)
  )].slice(0, 8);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <AsyncSelect
          ref={selectRef}
          cacheOptions
          defaultOptions={defaultOptions}
          loadOptions={loadOptions}
          onChange={handleChange}
          onInputChange={handleInputChange}
          formatOptionLabel={formatOptionLabel}
          placeholder={placeholder}
          isClearable
          isSearchable
          isDisabled={disabled}
          className="react-select-container"
          classNamePrefix="react-select"
          styles={customStyles}
          components={customComponents}
          onMenuOpen={() => setIsMenuOpen(true)}
          onMenuClose={() => setIsMenuOpen(false)}
          onFocus={() => {
            setIsFocused(true);
            if (showRecentSearches && recentSearches.length > 0) {
              setShowRecentPanel(true);
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            // Delay hiding the recent panel to allow for clicking
            setTimeout(() => {
              setShowRecentPanel(false);
            }, 200);
            if (onBlur) onBlur();
          }}
          noOptionsMessage={({ inputValue }) => 
            inputValue && inputValue.length < 2 
              ? 'Type at least 2 characters to search' 
              : noOptionsMessage
          }
          loadingMessage={() => loadingMessage}
          value={selectedLocation}
        />
        
        {/* Recent searches button */}
        {showRecentSearches && recentSearches.length > 0 && !isMenuOpen && (
          <button
            type="button"
            onClick={() => setShowRecentPanel(!showRecentPanel)}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            title="Recent searches"
          >
            <Clock className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Recent searches panel */}
      <AnimatePresence>
        {showRecentPanel && showRecentSearches && recentSearches.length > 0 && !isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-40 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-500 px-2">Recent Searches</h3>
                <button
                  type="button"
                  onClick={handleClearRecentSearches}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2"
                >
                  Clear
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {recentSearches.map((location, index) => (
                  <button
                    key={`${location.id}-${index}`}
                    type="button"
                    onClick={() => handleSelectRecentSearch(location)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center"
                  >
                    <Clock className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{location.name}</div>
                      <div className="text-xs text-gray-500">
                        {[location.region, location.country].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language indicator */}
      {showLanguageIndicator && userLanguage !== 'en' && (
        <div className="mt-1 flex items-center text-xs text-gray-500">
          <Globe className="h-3 w-3 mr-1 flex-shrink-0" />
          <span>
            Searching in {new Intl.DisplayNames([userLanguage], { type: 'language' }).of(userLanguage) || userLanguage}
          </span>
        </div>
      )}

      {/* Offline indicator */}
      {isOffline && (
        <div className="mt-1 flex items-center text-xs text-amber-600">
          <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
          <span>
            Offline mode: Using local city database
          </span>
        </div>
      )}

      {/* Error message */}
      <AnimatePresence>
        {(error || errorMessage) && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 text-sm text-red-600 flex items-center"
          >
            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
            {error || errorMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}