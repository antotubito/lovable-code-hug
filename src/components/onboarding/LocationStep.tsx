import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, ArrowLeft } from 'lucide-react';
import { CityAutocomplete } from '../common/CityAutocomplete';
import { AnimatedButton } from './AnimatedButton';
import type { Location } from '../../types/location';

interface LocationStepProps {
  location: string;
  from: string;
  onUpdate: (data: { location: string; from: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

export function LocationStep({ 
  location, 
  from, 
  onUpdate, 
  onNext, 
  onBack 
}: LocationStepProps) {
  const [currentLocation, setCurrentLocation] = useState(location);
  const [hometown, setHometown] = useState(from);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrentLocation, setSelectedCurrentLocation] = useState<Location | null>(null);
  const [selectedHometown, setSelectedHometown] = useState<Location | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Try to detect user's location on mount if no location is set
  useEffect(() => {
    if (!currentLocation && navigator.geolocation) {
      setIsDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Use reverse geocoding to get location name
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=${import.meta.env.VITE_OPENCAGE_API_KEY || 'f4b0b7ef11msh663d761ebea1d2fp15c6eajsnbb69d673cce0'}&no_annotations=1`
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.results && data.results.length > 0) {
                const result = data.results[0];
                const city = result.components.city || 
                             result.components.town || 
                             result.components.village || 
                             result.components.county;
                
                if (city) {
                  const country = result.components.country;
                  const locationString = `${city}, ${country}`;
                  setCurrentLocation(locationString);
                  
                  // Create location object
                  const locationObj: Location = {
                    id: `detected-${Date.now()}`,
                    name: city,
                    country: country,
                    countryCode: result.components.country_code?.toUpperCase() || '',
                    region: result.components.state || result.components.region || '',
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                  };
                  
                  setSelectedCurrentLocation(locationObj);
                  
                  // Update parent component
                  onUpdate({
                    location: locationString,
                    from: hometown
                  });
                }
              }
            }
          } catch (error) {
            console.error('Error detecting location:', error);
          } finally {
            setIsDetectingLocation(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsDetectingLocation(false);
        }
      );
    }
  }, [currentLocation, hometown, onUpdate]);

  const handleContinue = () => {
    // Validate that at least current location is provided
    if (!currentLocation.trim()) {
      setError('Please enter your current location');
      return;
    }
    
    // Update parent component with location data
    onUpdate({
      location: currentLocation,
      from: hometown
    });
    
    // Proceed to next step
    onNext();
  };

  const handleCurrentLocationSelect = (data: { name: string; location: Location | null }) => {
    setCurrentLocation(data.name);
    setSelectedCurrentLocation(data.location);
    setError(null);
  };

  const handleHometownSelect = (data: { name: string; location: Location | null }) => {
    setHometown(data.name);
    setSelectedHometown(data.location);
  };

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      {/* Location inputs */}
      <div className="space-y-6">
        <CityAutocomplete
          label="Where are you currently located?"
          value={currentLocation}
          onSelect={handleCurrentLocationSelect}
          placeholder={isDetectingLocation ? "Detecting your location..." : "Search your city..."}
          required
          errorMessage={error}
          storageKey="onboarding"
          fieldName="location"
          disabled={isDetectingLocation}
        />

        <CityAutocomplete
          label="Where are you from originally? (Optional)"
          value={hometown}
          onSelect={handleHometownSelect}
          placeholder="Search your hometown..."
          storageKey="onboarding"
          fieldName="from"
        />

        <p className="text-sm text-gray-500 mt-2">
          Your location helps us connect you with people nearby and provide relevant local information.
        </p>
      </div>

      {/* Navigation buttons */}
      <div className="flex space-x-3 pt-4">
        <AnimatedButton
          variant="secondary"
          onClick={onBack}
          icon={ArrowLeft}
        >
          Back
        </AnimatedButton>
        <AnimatedButton
          onClick={handleContinue}
        >
          Continue
        </AnimatedButton>
      </div>
    </div>
  );
}