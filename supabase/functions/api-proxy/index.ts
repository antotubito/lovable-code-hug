import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// API keys stored securely on the server with minimal permissions
const API_KEYS = {
  // OpenAI API key with only "Completions" access, no training data access
  openai: Deno.env.get("OPENAI_API_KEY") || "",
  
  // Google Maps API key restricted to:
  // - HTTP referrer restrictions (only from your domain)
  // - Only Places API, Geocoding API, and Maps JavaScript API
  // - Request quotas set to minimum required levels
  google_maps: Deno.env.get("GOOGLE_MAPS_API_KEY") || "",
  
  // Weather API key with:
  // - Current weather and forecast endpoints only
  // - Rate limiting configured
  weather: Deno.env.get("WEATHER_API_KEY") || "",
  
  // Unsplash API key with:
  // - Public access only (no write permissions)
  // - Demo mode for development
  unsplash: Deno.env.get("UNSPLASH_API_KEY") || "",
};

// CORS headers - restrict to your application domain in production
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // In production, replace with your domain
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Removed PUT, DELETE as they're not needed
};

// Supported API endpoints - explicitly define only what's needed
const API_ENDPOINTS = {
  openai: "https://api.openai.com/v1/chat/completions", // Only completions endpoint
  google_maps: {
    places: "https://maps.googleapis.com/maps/api/place",
    geocode: "https://maps.googleapis.com/maps/api/geocode"
  },
  weather: "https://api.openweathermap.org/data/2.5",
  unsplash: "https://api.unsplash.com/photos"
};

// Rate limiting configuration
const RATE_LIMITS = {
  openai: { maxRequests: 10, perMinute: true },
  google_maps: { maxRequests: 50, perMinute: true },
  weather: { maxRequests: 20, perMinute: true },
  unsplash: { maxRequests: 30, perHour: true }
};

// In-memory rate limiting (would use Redis in production)
const requestCounts = {};

// Check if request exceeds rate limits
function checkRateLimit(service: string, clientIp: string): boolean {
  const now = Date.now();
  const key = `${service}:${clientIp}`;
  
  if (!requestCounts[key]) {
    requestCounts[key] = { count: 0, resetAt: now + (RATE_LIMITS[service].perMinute ? 60000 : 3600000) };
  }
  
  // Reset counter if time expired
  if (now > requestCounts[key].resetAt) {
    requestCounts[key] = { count: 0, resetAt: now + (RATE_LIMITS[service].perMinute ? 60000 : 3600000) };
  }
  
  // Check if limit exceeded
  if (requestCounts[key].count >= RATE_LIMITS[service].maxRequests) {
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

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    
    // Parse request URL and query parameters
    const url = new URL(req.url);
    const service = url.searchParams.get("service");
    const endpoint = url.searchParams.get("endpoint");
    
    // Validate required parameters
    if (!service || !endpoint) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: service and endpoint" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Check if service is supported
    if (!API_ENDPOINTS[service]) {
      return new Response(
        JSON.stringify({ error: `Unsupported service: ${service}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Check if API key exists for the service
    if (!API_KEYS[service]) {
      return new Response(
        JSON.stringify({ error: `API key not configured for service: ${service}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Check rate limits
    if (!checkRateLimit(service, clientIp)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        {
          status: 429, // Too Many Requests
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": "60" // Suggest retry after 60 seconds
          },
        }
      );
    }
    
    // Build the target API URL based on service
    let targetUrl;
    if (service === "google_maps") {
      // For Google Maps, we need to determine which specific API to use
      const apiType = endpoint.startsWith("place") ? "places" : "geocode";
      targetUrl = `${API_ENDPOINTS.google_maps[apiType]}/${endpoint}`;
    } else if (typeof API_ENDPOINTS[service] === "string") {
      targetUrl = `${API_ENDPOINTS[service]}/${endpoint}`;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid endpoint configuration" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Get request body if present
    let requestBody = null;
    if (req.method !== "GET" && req.headers.get("content-type")?.includes("application/json")) {
      requestBody = await req.json();
      
      // Sanitize request body to prevent injection attacks
      requestBody = sanitizeRequestBody(requestBody, service);
    }
    
    // Prepare headers for the API request
    const headers = new Headers();
    
    // Add service-specific headers with minimal permissions
    switch (service) {
      case "openai":
        headers.set("Authorization", `Bearer ${API_KEYS.openai}`);
        headers.set("Content-Type", "application/json");
        // Limit model access to only what's needed
        if (requestBody && !requestBody.model) {
          requestBody.model = "gpt-3.5-turbo"; // Default to cheaper model
        }
        break;
        
      case "unsplash":
        headers.set("Authorization", `Client-ID ${API_KEYS.unsplash}`);
        // Limit to read-only operations
        if (req.method !== "GET") {
          return new Response(
            JSON.stringify({ error: "Only GET requests are allowed for this service" }),
            {
              status: 405,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        break;
        
      case "google_maps":
        // Google Maps API key is added as a query parameter
        // No additional headers needed
        break;
        
      case "weather":
        // Weather API key is added as a query parameter
        // No additional headers needed
        break;
        
      default:
        headers.set("Content-Type", "application/json");
    }
    
    // Copy only essential headers from the original request
    ["accept", "accept-language"].forEach(header => {
      if (req.headers.has(header)) {
        headers.set(header, req.headers.get(header));
      }
    });
    
    // Prepare the fetch options
    const fetchOptions = {
      method: req.method,
      headers,
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    };
    
    // Build the final URL with API key for services that use query parameters
    let finalUrl = targetUrl;
    if (service === "google_maps" || service === "weather") {
      const separator = finalUrl.includes("?") ? "&" : "?";
      finalUrl += `${separator}key=${API_KEYS[service]}`;
      
      // Add additional restrictions for Google Maps API
      if (service === "google_maps") {
        finalUrl += "&libraries=places"; // Only request places library
      }
    }
    
    // Make the API request
    const response = await fetch(finalUrl, fetchOptions);
    
    // Get the response data
    const responseData = await response.json();
    
    // Filter sensitive data from response if needed
    const sanitizedResponse = sanitizeResponse(responseData, service);
    
    // Return the API response
    return new Response(JSON.stringify(sanitizedResponse), {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Log the error (Supabase Edge Functions automatically capture logs)
    console.error("API proxy error:", error);
    
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

// Sanitize request body to prevent injection attacks
function sanitizeRequestBody(body: any, service: string): any {
  // Deep clone to avoid modifying the original
  const sanitized = JSON.parse(JSON.stringify(body));
  
  switch (service) {
    case "openai":
      // Limit token usage to control costs
      if (!sanitized.max_tokens || sanitized.max_tokens > 1000) {
        sanitized.max_tokens = 1000;
      }
      // Ensure temperature is reasonable
      if (sanitized.temperature === undefined || sanitized.temperature > 1) {
        sanitized.temperature = 0.7;
      }
      break;
      
    case "google_maps":
      // Remove any attempts to bypass restrictions
      delete sanitized.key;
      delete sanitized.signature;
      break;
      
    case "weather":
      // Limit to essential parameters
      const allowedParams = ["lat", "lon", "q", "units", "lang"];
      Object.keys(sanitized).forEach(key => {
        if (!allowedParams.includes(key)) {
          delete sanitized[key];
        }
      });
      break;
  }
  
  return sanitized;
}

// Remove sensitive information from responses
function sanitizeResponse(response: any, service: string): any {
  // Deep clone to avoid modifying the original
  const sanitized = JSON.parse(JSON.stringify(response));
  
  switch (service) {
    case "google_maps":
      // Remove any billing or sensitive data
      if (sanitized.results) {
        sanitized.results.forEach(result => {
          delete result.business_status;
          delete result.plus_code;
        });
      }
      break;
      
    case "openai":
      // Remove usage information that could expose billing details
      delete sanitized.usage;
      break;
  }
  
  return sanitized;
}