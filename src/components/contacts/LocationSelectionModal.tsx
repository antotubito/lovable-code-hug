import React, { useState, useEffect } from 'react';
import { MapPin, Search, X, Navigation, Compass, Building2, Coffee, Briefcase, ArrowLeft, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../../lib/apiService';

interface Location {
  id: string;
  name: string;
  address?: string;
  category?: string;
  distance?: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface LocationSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: { name: string; latitude: number; longitude: number; venue?: string; eventContext?: string }) => void;
  onSkip?: () => void;
  currentLocation?: { latitude: number; longitude: number };
  username: string;
  suggestedLocation?: {
    name: string;
    latitude: number;
    longitude: number;
    venue?: string;
    eventContext?: string;
  };
  onBack?: () => void;
}

export function LocationSelectionModal({
  isOpen,
  onClose,
  onSelect,
  onSkip,
  currentLocation,
  username,
  suggestedLocation,
  onBack
}: LocationSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [nearbyLocations, setNearbyLocations] = useState<Location[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; latitude: number; longitude: number; venue?: string } | null>(null);
  const [eventContext, setEventContext] = useState('');
  const [showEventContextInput, setShowEventContextInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setSelectedLocation(null);
      setEventContext('');
      setShowEventContextInput(false);
      
      // Try to get user's current location
      if (!currentLocation && !suggestedLocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            loadNearbyLocations(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            console.error('Error getting location:', error);
            setLoading(false);
          }
        );
      } else if (currentLocation) {
        loadNearbyLocations(currentLocation.latitude, currentLocation.longitude);
      } else if (suggestedLocation) {
        loadNearbyLocations(suggestedLocation.latitude, suggestedLocation.longitude);
      }
    }
  }, [isOpen, currentLocation, suggestedLocation]);

  async function loadNearbyLocations(latitude: number, longitude: number) {
    setLoading(true);
    try {
      // Use the Edge Function to get nearby places
      const response = await apiService.locations.nearby(latitude, longitude, 1000);
      
      if (response && response.places) {
        const locations: Location[] = response.places.map(place => ({
          id: place.id,
          name: place.name,
          address: place.address,
          category: getCategoryFromTypes(place.types),
          distance: calculateDistance(latitude, longitude, place.latitude, place.longitude),
          coordinates: {
            latitude: place.latitude,
            longitude: place.longitude
          }
        }));
        
        setNearbyLocations(locations);
      }
    } catch (error) {
      console.error('Error loading nearby locations:', error);
      // Fallback to mock data if API fails
      setNearbyLocations(getMockNearbyLocations(latitude, longitude));
    } finally {
      setLoading(false);
    }
  }

  // Function to determine category from place types
  function getCategoryFromTypes(types: string[]): string {
    if (!types || types.length === 0) return 'Other';
    
    if (types.includes('cafe')) return 'Café';
    if (types.includes('restaurant')) return 'Restaurant';
    if (types.includes('bar')) return 'Bar';
    if (types.includes('office')) return 'Office';
    if (types.includes('store') || types.includes('shop')) return 'Store';
    if (types.includes('hotel')) return 'Hotel';
    if (types.includes('airport')) return 'Airport';
    if (types.includes('train_station')) return 'Train Station';
    if (types.includes('park')) return 'Park';
    if (types.includes('museum')) return 'Museum';
    
    return 'Other';
  }

  // Calculate distance between two points using Haversine formula
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return parseFloat(distance.toFixed(1));
  }

  function toRad(value: number): number {
    return value * Math.PI / 180;
  }

  // Fallback mock data
  function getMockNearbyLocations(latitude: number, longitude: number): Location[] {
    // For Lisbon, Praça das Flores area
    if (latitude >= 38.7 && latitude <= 38.73 && longitude >= -9.15 && longitude <= -9.14) {
      return [
        {
          id: 'praca-das-flores',
          name: 'Praça das Flores',
          address: 'Praça das Flores, Lisboa, Portugal',
          category: 'Park',
          distance: 0.1,
          coordinates: {
            latitude: 38.7156,
            longitude: -9.1470
          }
        },
        {
          id: 'cafe-jardim',
          name: 'Café Jardim das Flores',
          address: 'Praça das Flores 37, Lisboa, Portugal',
          category: 'Café',
          distance: 0.05,
          coordinates: {
            latitude: 38.7158,
            longitude: -9.1472
          }
        },
        {
          id: 'restaurante-flores',
          name: 'Restaurante Flores',
          address: 'Praça das Flores 42, Lisboa, Portugal',
          category: 'Restaurant',
          distance: 0.08,
          coordinates: {
            latitude: 38.7155,
            longitude: -9.1468
          }
        },
        {
          id: 'principe-real',
          name: 'Jardim do Príncipe Real',
          address: 'Praça do Príncipe Real, Lisboa, Portugal',
          category: 'Park',
          distance: 0.4,
          coordinates: {
            latitude: 38.7178,
            longitude: -9.1487
          }
        },
        {
          id: 'miradouro-santa-catarina',
          name: 'Miradouro de Santa Catarina',
          address: 'R. de Santa Catarina, Lisboa, Portugal',
          category: 'Viewpoint',
          distance: 0.7,
          coordinates: {
            latitude: 38.7103,
            longitude: -9.1470
          }
        }
      ];
    }
    
    return [
      {
        id: '1',
        name: 'Tech Hub Café',
        address: '123 Innovation St',
        category: 'Café',
        distance: 0.2,
        coordinates: {
          latitude: latitude + 0.001,
          longitude: longitude + 0.001
        }
      },
      {
        id: '2',
        name: 'Startup Center',
        address: '456 Venture Ave',
        category: 'Office',
        distance: 0.3,
        coordinates: {
          latitude: latitude - 0.001,
          longitude: longitude + 0.002
        }
      },
      {
        id: '3',
        name: 'Innovation Space',
        address: '789 Creator Blvd',
        category: 'Coworking',
        distance: 0.4,
        coordinates: {
          latitude: latitude + 0.002,
          longitude: longitude - 0.001
        }
      }
    ];
  }

  const handleLocationClick = (location: Location) => {
    setSelectedLocation({
      name: location.name,
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude,
      venue: location.address
    });
    setShowEventContextInput(true);
  };

  const handleEventContextSubmit = () => {
    if (selectedLocation) {
      onSelect({
        ...selectedLocation,
        eventContext: eventContext.trim() || undefined
      });
    }
  };

  const handleContinue = () => {
    const baseLocation = suggestedLocation || currentLocation || userLocation || { latitude: 0, longitude: 0 };
    setSelectedLocation({
      name: searchQuery || 'Custom Location',
      latitude: baseLocation.latitude,
      longitude: baseLocation.longitude
    });
    setShowEventContextInput(true);
  };

  const handleLocationSkip = () => {
    if (onSkip) {
      onSkip();
    } else if (suggestedLocation) {
      onSelect({
        ...suggestedLocation,
        eventContext: undefined
      });
    } else if (currentLocation) {
      onSelect({
        name: 'Current Location',
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      });
    } else if (userLocation) {
      onSelect({
        name: 'Current Location',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      });
    } else {
      onSelect({
        name: 'Unknown Location',
        latitude: 0,
        longitude: 0
      });
    }
  };

  const filteredLocations = nearbyLocations.filter(location =>
    !searchQuery || 
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'café':
        return Coffee;
      case 'office':
        return Building2;
      case 'coworking':
        return Briefcase;
      default:
        return MapPin;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col"
          >
            {showEventContextInput ? (
              <>
                {/* Event Context Input */}
                <div className="flex-shrink-0 p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        What was the occasion?
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Add context about how you met {username}
                      </p>
                    </div>
                    <div
                      onClick={() => setShowEventContextInput(false)}
                      className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setShowEventContextInput(false);
                        }
                      }}
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-700 mb-4">
                      <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="font-medium">
                        {selectedLocation?.name}
                        {selectedLocation?.venue && (
                          <span className="text-gray-500 ml-1">
                            ({selectedLocation.venue})
                          </span>
                        )}
                      </span>
                    </div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event or Occasion (Optional)
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={eventContext}
                        onChange={(e) => setEventContext(e.target.value)}
                        placeholder="e.g., Conference, Birthday Party, Networking Event..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      This helps you remember the context of how you met {username}
                    </p>
                  </div>

                  <div className="mt-6 bg-indigo-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-indigo-800 mb-2">Suggestions:</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Lisbon Tech Meetup', 'Coffee Chat', 'Networking Event', 'Business Meeting', 
                        'Conference', 'Startup Pitch', 'Workshop', 'Community Gathering', 
                        'Product Demo', 'Casual Encounter'].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => setEventContext(suggestion)}
                          className="px-3 py-1 bg-white border border-indigo-200 rounded-full text-xs text-indigo-700 hover:bg-indigo-100"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 p-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setShowEventContextInput(false)}
                      className="flex items-center px-4 py-2.5 text-gray-700 hover:text-gray-900 text-base"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Back
                    </button>
                    <div className="flex space-x-3 ml-auto">
                      <button
                        onClick={handleEventContextSubmit}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-base font-medium hover:bg-indigo-700"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Header */}
                <div className="flex-shrink-0 p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Confirm Connection Location
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Where did you meet {username}?
                      </p>
                    </div>
                    <div
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onClose();
                        }
                      }}
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                  
                  {/* Search Input */}
                  <div className="mt-4 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search or enter a location name..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Location List */}
                <div className="flex-1 overflow-y-auto">
                  {/* GPS Suggested Location */}
                  {suggestedLocation && (
                    <div className="p-4 border-b border-gray-200 bg-indigo-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-indigo-600">
                          <Navigation className="h-5 w-5" />
                          <span className="ml-2 font-medium">GPS Detected Location</span>
                        </div>
                        <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                          Suggested
                        </span>
                      </div>
                      <div 
                        className="bg-white rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleLocationClick({
                          id: 'suggested',
                          name: suggestedLocation.name,
                          address: suggestedLocation.venue,
                          coordinates: {
                            latitude: suggestedLocation.latitude,
                            longitude: suggestedLocation.longitude
                          }
                        })}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleLocationClick({
                              id: 'suggested',
                              name: suggestedLocation.name,
                              address: suggestedLocation.venue,
                              coordinates: {
                                latitude: suggestedLocation.latitude,
                                longitude: suggestedLocation.longitude
                              }
                            });
                          }
                        }}
                      >
                        <h3 className="font-medium text-gray-900">{suggestedLocation.name}</h3>
                        {suggestedLocation.venue && (
                          <p className="text-sm text-gray-500 mt-1">{suggestedLocation.venue}</p>
                        )}
                        {suggestedLocation.eventContext && (
                          <p className="text-sm text-indigo-600 font-medium mt-1">
                            {suggestedLocation.eventContext}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Current Location */}
                  {userLocation && !suggestedLocation && (
                    <div className="p-4 border-b border-gray-200 bg-indigo-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-indigo-600">
                          <Compass className="h-5 w-5" />
                          <span className="ml-2 font-medium">Current Location</span>
                        </div>
                      </div>
                      <div 
                        className="bg-white rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleLocationClick({
                          id: 'current',
                          name: 'Current Location',
                          coordinates: {
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude
                          }
                        })}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleLocationClick({
                              id: 'current',
                              name: 'Current Location',
                              coordinates: {
                                latitude: userLocation.latitude,
                                longitude: userLocation.longitude
                              }
                            });
                          }
                        }}
                      >
                        <h3 className="font-medium text-gray-900">Current Location</h3>
                        <p className="text-sm text-gray-500 mt-1">Use your current GPS location</p>
                      </div>
                    </div>
                  )}

                  {/* Nearby Locations */}
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Nearby Places</h3>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : filteredLocations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No locations found nearby
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredLocations.map((location) => {
                          const Icon = getCategoryIcon(location.category);
                          return (
                            <div
                              key={location.id}
                              className="w-full p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 cursor-pointer"
                              onClick={() => handleLocationClick(location)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  handleLocationClick(location);
                                }
                              }}
                            >
                              <div className="flex items-start">
                                <Icon className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                                <div className="ml-3">
                                  <h3 className="text-sm font-medium text-gray-900">
                                    {location.name}
                                  </h3>
                                  {location.address && (
                                    <p className="text-sm text-gray-500 mt-1">
                                      {location.address}
                                    </p>
                                  )}
                                  <div className="flex items-center mt-2 space-x-2">
                                    {location.category && (
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                        {location.category}
                                      </span>
                                    )}
                                    {location.distance && (
                                      <span className="text-xs text-gray-500">
                                        {location.distance} km away
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 p-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    {onBack && (
                      <button
                        onClick={onBack}
                        className="flex items-center px-4 py-2.5 text-gray-700 hover:text-gray-900 text-base"
                      >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back
                      </button>
                    )}
                    <div className="flex space-x-3 ml-auto">
                      <button
                        onClick={handleLocationSkip}
                        className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-base font-medium hover:bg-gray-50"
                      >
                        Skip
                      </button>
                      <button
                        onClick={handleContinue}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-base font-medium hover:bg-indigo-700"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}