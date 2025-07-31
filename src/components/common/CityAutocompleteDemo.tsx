import React, { useState, useEffect } from 'react';
import { CityAutocomplete } from './CityAutocomplete';
import type { Location } from '../../types/location';
import { getPopularCities } from '../../lib/nominatimService';

interface CityAutocompleteDemoProps {
  initialValue?: string;
  onLanguageChange?: (language: string) => void;
}

export function CityAutocompleteDemo({ initialValue = '', onLanguageChange }: CityAutocompleteDemoProps) {
  const [selectedCity, setSelectedCity] = useState(initialValue);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [language, setLanguage] = useState('en');
  const [customLanguage, setCustomLanguage] = useState('');
  const [useCustomLanguage, setUseCustomLanguage] = useState(false);
  const [recentSearches, setRecentSearches] = useState<Location[]>([]);

  useEffect(() => {
    // Load recent searches from localStorage
    try {
      const savedSearches = localStorage.getItem('recentLocationSearches');
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    } catch (err) {
      console.error('Error loading recent searches:', err);
    }
  }, []);

  const handleCitySelect = (data: { name: string; location: Location | null }) => {
    setSelectedCity(data.name);
    setSelectedLocation(data.location);
    console.log('Selected city:', data.name);
    console.log('Location data:', data.location);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };

  const handleCustomLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomLanguage(e.target.value);
    if (onLanguageChange && useCustomLanguage) {
      onLanguageChange(e.target.value);
    }
  };

  const toggleCustomLanguage = () => {
    const newState = !useCustomLanguage;
    setUseCustomLanguage(newState);
    if (onLanguageChange) {
      onLanguageChange(newState ? customLanguage : language);
    }
  };

  const handleClearRecentSearches = () => {
    localStorage.removeItem('recentLocationSearches');
    setRecentSearches([]);
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">City Autocomplete Demo</h2>
      
      {/* Language Controls */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language Override
          </label>
          <div className="flex items-center space-x-2">
            <select
              value={language}
              onChange={handleLanguageChange}
              disabled={useCustomLanguage}
              className="block rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="it">Italian</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
              <option value="zh">Chinese</option>
              <option value="ru">Russian</option>
              <option value="ar">Arabic</option>
              <option value="hi">Hindi</option>
              <option value="pt">Portuguese</option>
            </select>
            <div className="flex items-center">
              <input
                id="custom-language"
                type="checkbox"
                checked={useCustomLanguage}
                onChange={toggleCustomLanguage}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="custom-language" className="ml-2 block text-sm text-gray-700">
                Custom
              </label>
            </div>
          </div>
        </div>
        
        {useCustomLanguage && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Language Code
            </label>
            <input
              type="text"
              value={customLanguage}
              onChange={handleCustomLanguageChange}
              placeholder="e.g., nl, sv, ko"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter a valid ISO 639-1 language code (2 letters)
            </p>
          </div>
        )}
      </div>
      
      {/* City Autocomplete Component */}
      <div>
        <CityAutocomplete
          label="Search for a city"
          value={selectedCity}
          onSelect={handleCitySelect}
          placeholder="Type to search cities..."
          language={useCustomLanguage ? customLanguage : language}
          showLanguageIndicator={true}
          storageKey="demo"
          fieldName="selectedCity"
          initialSuggestions={getPopularCities(8)}
          showRecentSearches={true}
          maxRecentSearches={10}
        />
      </div>
      
      {/* Recent Searches Section */}
      {recentSearches.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Recent Searches</h3>
            <button
              onClick={handleClearRecentSearches}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recentSearches.slice(0, 6).map((location, index) => (
              <div 
                key={`${location.id}-${index}`}
                className="p-2 bg-white rounded border border-gray-200 text-sm"
              >
                <div className="font-medium">{location.name}</div>
                <div className="text-xs text-gray-500">
                  {[location.region, location.country].filter(Boolean).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Selected City Information */}
      {selectedLocation && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Selected Location Data:</h3>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
            {JSON.stringify(selectedLocation, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="text-sm text-gray-500">
        <p>Try searching for cities in different languages based on the selected language.</p>
        <p>For example, try "Firenze" with Italian selected, or "München" with German.</p>
        <p className="mt-2 text-xs">
          <strong>Note:</strong> This component now uses OpenStreetMap's Nominatim API for city search with local fallback.
        </p>
      </div>
    </div>
  );
}