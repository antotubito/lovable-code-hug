import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// API key stored securely on the server with restricted permissions
// This key should be configured with:
// 1. HTTP referrer restrictions (only from your domain)
// 2. API restrictions (only Places API and Geocoding API)
// 3. Request quotas set to minimum required levels
const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY") || "";

// CORS headers - restrict to your application domain in production
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // In production, replace with your domain
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS", // Only allow GET and OPTIONS
};

// Rate limiting configuration
const RATE_LIMITS = {
  search: { maxRequests: 10, perMinute: true },
  geocode: { maxRequests: 10, perMinute: true },
  reverseGeocode: { maxRequests: 10, perMinute: true },
  nearby: { maxRequests: 20, perMinute: true }
};

// In-memory rate limiting (would use Redis in production)
const requestCounts = {};

// Check if request exceeds rate limits
function checkRateLimit(endpoint: string, clientIp: string): boolean {
  const now = Date.now();
  const key = `${endpoint}:${clientIp}`;
  
  if (!requestCounts[key]) {
    requestCounts[key] = { 
      count: 0, 
      resetAt: now + (RATE_LIMITS[endpoint].perMinute ? 60000 : 3600000) 
    };
  }
  
  // Reset counter if time expired
  if (now > requestCounts[key].resetAt) {
    requestCounts[key] = { 
      count: 0, 
      resetAt: now + (RATE_LIMITS[endpoint].perMinute ? 60000 : 3600000) 
    };
  }
  
  // Check if limit exceeded
  if (requestCounts[key].count >= RATE_LIMITS[endpoint].maxRequests) {
    return false;
  }
  
  // Increment counter
  requestCounts[key].count++;
  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  // Only allow GET requests for security
  if (req.method !== "GET" && req.method !== "OPTIONS") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // Handle different location services
    switch (path) {
      case "search":
        // Check rate limit
        if (!checkRateLimit("search", clientIp)) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
            {
              status: 429,
              headers: { 
                ...corsHeaders, 
                "Content-Type": "application/json",
                "Retry-After": "60"
              },
            }
          );
        }
        return await handleLocationSearch(req, url);
        
      case "geocode":
        // Check rate limit
        if (!checkRateLimit("geocode", clientIp)) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
            {
              status: 429,
              headers: { 
                ...corsHeaders, 
                "Content-Type": "application/json",
                "Retry-After": "60"
              },
            }
          );
        }
        return await handleGeocode(req, url);
        
      case "reverse-geocode":
        // Check rate limit
        if (!checkRateLimit("reverseGeocode", clientIp)) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
            {
              status: 429,
              headers: { 
                ...corsHeaders, 
                "Content-Type": "application/json",
                "Retry-After": "60"
              },
            }
          );
        }
        return await handleReverseGeocode(req, url);
        
      case "nearby":
        // Check rate limit
        if (!checkRateLimit("nearby", clientIp)) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
            {
              status: 429,
              headers: { 
                ...corsHeaders, 
                "Content-Type": "application/json",
                "Retry-After": "60"
              },
            }
          );
        }
        return await handleNearbySearch(req, url);
        
      default:
        return new Response(
          JSON.stringify({ error: "Unknown endpoint" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }
  } catch (error) {
    console.error("Location service error:", error);
    
    // Return error response without exposing internal details
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: "An error occurred while processing your request" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Handler for location search with input validation
async function handleLocationSearch(req: Request, url: URL) {
  const query = url.searchParams.get("query");
  
  // Validate input
  if (!query || query.length < 2 || query.length > 100) {
    return new Response(
      JSON.stringify({ error: "Invalid query parameter. Must be between 2 and 100 characters." }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  
  // Sanitize input to prevent injection
  const sanitizedQuery = query.replace(/[^\w\s,.-]/g, '');
  
  // Call Google Places API with minimal fields requested
  const apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${
    encodeURIComponent(sanitizedQuery)
  }&key=${GOOGLE_MAPS_API_KEY}&fields=place_id,name,formatted_address,geometry`;
  
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  // Transform the response to our application format with only necessary fields
  const locations = data.results.map(place => ({
    id: place.place_id,
    name: place.name,
    address: place.formatted_address,
    latitude: place.geometry.location.lat,
    longitude: place.geometry.location.lng,
    // Only include essential fields
    types: place.types ? place.types.slice(0, 3) : [], // Limit to first 3 types
  })).slice(0, 10); // Limit to 10 results for performance
  
  return new Response(
    JSON.stringify({ locations }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

// Handler for geocoding with input validation
async function handleGeocode(req: Request, url: URL) {
  const address = url.searchParams.get("address");
  
  // Validate input
  if (!address || address.length < 3 || address.length > 100) {
    return new Response(
      JSON.stringify({ error: "Invalid address parameter. Must be between 3 and 100 characters." }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  
  // Sanitize input
  const sanitizedAddress = address.replace(/[^\w\s,.-]/g, '');
  
  // Call Google Geocoding API with minimal fields
  const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${
    encodeURIComponent(sanitizedAddress)
  }&key=${GOOGLE_MAPS_API_KEY}`;
  
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  if (data.status !== "OK" || !data.results.length) {
    return new Response(
      JSON.stringify({ error: "Geocoding failed", details: data.status }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  
  const result = data.results[0];
  // Return only essential location data
  const location = {
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
    placeId: result.place_id,
  };
  
  return new Response(
    JSON.stringify({ location }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

// Handler for reverse geocoding with input validation
async function handleReverseGeocode(req: Request, url: URL) {
  const latitude = url.searchParams.get("latitude");
  const longitude = url.searchParams.get("longitude");
  
  // Validate input
  if (!latitude || !longitude) {
    return new Response(
      JSON.stringify({ error: "Missing latitude or longitude parameters" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  
  // Validate coordinate ranges
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return new Response(
      JSON.stringify({ error: "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180." }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  
  // Call Google Reverse Geocoding API
  const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
  
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  if (data.status !== "OK" || !data.results.length) {
    return new Response(
      JSON.stringify({ error: "Reverse geocoding failed", details: data.status }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  
  // Extract only necessary address components
  const result = data.results[0];
  const addressComponents = {};
  
  // Only extract essential address components
  const essentialTypes = [
    'country', 
    'administrative_area_level_1', 
    'locality', 
    'postal_code'
  ];
  
  result.address_components.forEach(component => {
    component.types.forEach(type => {
      if (essentialTypes.includes(type)) {
        addressComponents[type] = component.long_name;
      }
    });
  });
  
  const location = {
    formattedAddress: result.formatted_address,
    placeId: result.place_id,
    addressComponents,
    latitude: lat,
    longitude: lng,
  };
  
  return new Response(
    JSON.stringify({ location }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

// Handler for nearby search with input validation
async function handleNearbySearch(req: Request, url: URL) {
  const latitude = url.searchParams.get("latitude");
  const longitude = url.searchParams.get("longitude");
  const radius = url.searchParams.get("radius") || "1000"; // Default 1km
  const type = url.searchParams.get("type") || ""; // Optional place type
  
  // Validate input
  if (!latitude || !longitude) {
    return new Response(
      JSON.stringify({ error: "Missing latitude or longitude parameters" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  
  // Validate coordinate ranges
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const rad = parseInt(radius, 10);
  
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return new Response(
      JSON.stringify({ error: "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180." }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  
  // Limit radius to reasonable values (50m to 5km)
  const safeRadius = Math.max(50, Math.min(5000, rad));
  
  // Validate place type if provided
  const validTypes = [
    'restaurant', 'cafe', 'bar', 'lodging', 'store', 
    'airport', 'train_station', 'bus_station', 'park',
    'museum', 'library', 'university', 'school', 'hospital',
    'doctor', 'pharmacy', 'police', 'post_office', 'bank',
    'atm', 'gas_station', 'parking', 'shopping_mall'
  ];
  
  let apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${safeRadius}&key=${GOOGLE_MAPS_API_KEY}`;
  
  if (type && validTypes.includes(type)) {
    apiUrl += `&type=${type}`;
  }
  
  // Request only essential fields to minimize data transfer
  apiUrl += "&fields=place_id,name,vicinity,geometry,types,rating";
  
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  // Transform the response to include only necessary data
  const places = data.results.map(place => ({
    id: place.place_id,
    name: place.name,
    latitude: place.geometry.location.lat,
    longitude: place.geometry.location.lng,
    address: place.vicinity,
    types: place.types ? place.types.slice(0, 3) : [], // Limit to first 3 types
    rating: place.rating,
  })).slice(0, 15); // Limit to 15 results for performance
  
  return new Response(
    JSON.stringify({ places }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}