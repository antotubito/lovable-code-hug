export interface Location {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  region?: string;
  latitude: number;
  longitude: number;
  population?: number;
  timezone?: string;
  localizedName?: string; // Store the localized name when different from English
  // For react-select compatibility
  label?: string;
  value?: string;
}

export interface GeocodingResult {
  formattedAddress: string;
  placeId: string;
  latitude: number;
  longitude: number;
  addressComponents: {
    country?: string;
    country_code?: string;
    administrative_area_level_1?: string;
    locality?: string;
    postal_code?: string;
  };
}

export interface NearbyPlace {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  types?: string[];
  rating?: number;
}

export interface LocationSearchResponse {
  locations: Location[];
}

export interface ReverseGeocodingResponse {
  location: GeocodingResult;
}

export interface NearbyPlacesResponse {
  places: NearbyPlace[];
}