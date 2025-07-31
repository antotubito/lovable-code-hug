import React, { useState, useEffect } from 'react';
import { CityAutocompleteDemo } from '../components/common/CityAutocompleteDemo';
import { userPreferences } from '../lib/userPreferences';
import { Location } from '../types/location';
import { useAuth } from '../components/auth/AuthProvider';

export function Demo() {
  const { user } = useAuth();
  const [language, setLanguage] = useState('en');
  const [savedLocations, setSavedLocations] = useState<Record<string, Location | null>>({});
  const [loading, setLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState<Location[]>([]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    console.log(`Language changed to: ${newLanguage}`);
  };

  // Load saved locations and recent searches on mount
  useEffect(() => {
    const loadSavedData = async () => {
      setLoading(true);
      try {
        // Load location preferences
        const currentLocation = await userPreferences.getLocationPreference('location');
        const hometown = await userPreferences.getLocationPreference('from');
        
        setSavedLocations({
          location: currentLocation,
          from: hometown
        });

        // Load recent searches
        const savedSearches = localStorage.getItem('recentLocationSearches');
        if (savedSearches) {
          setRecentSearches(JSON.parse(savedSearches));
        }
      } catch (err) {
        console.error('Error loading saved data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Component Demos</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">City Autocomplete with Nominatim API</h2>
        <div className="bg-indigo-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-indigo-700">
            This component uses <strong>OpenStreetMap's Nominatim API</strong> to search for cities worldwide, including small towns and villages.
            It falls back to a local database when offline or when the API is unavailable.
          </p>
        </div>
        <CityAutocompleteDemo 
          onLanguageChange={handleLanguageChange}
        />
      </div>
      
      <div className="bg-indigo-50 p-4 rounded-lg mb-8">
        <p className="text-sm text-indigo-700">
          Current language: <strong>{language}</strong>
        </p>
        <p className="text-sm text-indigo-700 mt-2">
          The component will search for cities in the selected language, but display results in English for consistency.
        </p>
      </div>
      
      {/* Saved Locations Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved Locations</h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Current Location</h3>
              {savedLocations.location ? (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{savedLocations.location.name}</p>
                  <p className="text-sm text-gray-500">
                    {savedLocations.location.country} ({savedLocations.location.countryCode})
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Coordinates: {savedLocations.location.latitude.toFixed(4)}, {savedLocations.location.longitude.toFixed(4)}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500">No saved location</p>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700">Hometown</h3>
              {savedLocations.from ? (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{savedLocations.from.name}</p>
                  <p className="text-sm text-gray-500">
                    {savedLocations.from.country} ({savedLocations.from.countryCode})
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Coordinates: {savedLocations.from.latitude.toFixed(4)}, {savedLocations.from.longitude.toFixed(4)}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500">No saved hometown</p>
              )}
            </div>
            
            {/* Recent Searches Section */}
            {recentSearches.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recentSearches.slice(0, 6).map((location, index) => (
                    <div 
                      key={`${location.id}-${index}`}
                      className="p-2 bg-gray-50 rounded border border-gray-200 text-sm"
                    >
                      <div className="font-medium">{location.name}</div>
                      <div className="text-xs text-gray-500">
                        {[location.region, location.country].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('recentLocationSearches');
                    setRecentSearches([]);
                  }}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear Recent Searches
                </button>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {user ? (
                  <>Your location preferences are saved to both localStorage and your Supabase profile.</>
                ) : (
                  <>Your location preferences are saved to localStorage. Sign in to sync them with your profile.</>
                )}
              </p>
              
              <button
                onClick={async () => {
                  try {
                    await userPreferences.clearAllPreferences();
                    setSavedLocations({});
                    setRecentSearches([]);
                    localStorage.removeItem('recentLocationSearches');
                    alert('All preferences cleared successfully');
                  } catch (err) {
                    console.error('Error clearing preferences:', err);
                    alert('Error clearing preferences');
                  }
                }}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Clear All Saved Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}