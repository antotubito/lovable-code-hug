import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// API key stored securely on the server with restricted permissions
// This key should be configured with:
// 1. Domain restrictions (only from your domain)
// 2. Usage limits set to minimum required levels
// 3. Only current weather and forecast endpoints enabled
const WEATHER_API_KEY = Deno.env.get("WEATHER_API_KEY") || "";

// CORS headers - restrict to your application domain in production
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // In production, replace with your domain
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS", // Only allow GET and OPTIONS
};

// Rate limiting configuration
const RATE_LIMITS = {
  current: { maxRequests: 10, perMinute: true },
  forecast: { maxRequests: 5, perMinute: true }
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

    // Handle different weather services
    switch (path) {
      case "current":
        // Check rate limit
        if (!checkRateLimit("current", clientIp)) {
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
        return await handleCurrentWeather(req, url);
        
      case "forecast":
        // Check rate limit
        if (!checkRateLimit("forecast", clientIp)) {
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
        return await handleForecast(req, url);
        
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
    console.error("Weather service error:", error);
    
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

// Handler for current weather with input validation
async function handleCurrentWeather(req: Request, url: URL) {
  const latitude = url.searchParams.get("latitude");
  const longitude = url.searchParams.get("longitude");
  const city = url.searchParams.get("city");
  
  // Validate input parameters
  if ((!latitude || !longitude) && !city) {
    return new Response(
      JSON.stringify({ error: "Missing location parameters. Provide either latitude/longitude or city name" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  
  // Validate coordinate ranges if provided
  if (latitude && longitude) {
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
  }
  
  // Validate city name if provided
  if (city && (city.length < 2 || city.length > 50 || !/^[a-zA-Z\s,.-]+$/.test(city))) {
    return new Response(
      JSON.stringify({ error: "Invalid city name. Must be between 2 and 50 characters and contain only letters, spaces, commas, periods, and hyphens." }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  
  // Build API URL based on provided parameters
  let apiUrl;
  if (latitude && longitude) {
    apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`;
  } else {
    apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${WEATHER_API_KEY}`;
  }
  
  // Add language parameter for localization
  apiUrl += "&lang=en"; // Default to English
  
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  if (data.cod !== 200) {
    return new Response(
      JSON.stringify({ error: "Weather data not found", details: data.message }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  
  // Transform the response to a cleaner format with only necessary data
  const weather = {
    location: {
      name: data.name,
      country: data.sys.country,
      latitude: data.coord.lat,
      longitude: data.coord.lon,
    },
    current: {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      condition: data.weather[0].main,
      // Only include essential fields
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      timestamp: data.dt,
    },
  };
  
  return new Response(
    JSON.stringify({ weather }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

// Handler for weather forecast with input validation
async function handleForecast(req: Request, url: URL) {
  const latitude = url.searchParams.get("latitude");
  const longitude = url.searchParams.get("longitude");
  const city = url.searchParams.get("city");
  const days = parseInt(url.searchParams.get("days") || "5", 10);
  
  // Validate input parameters
  if ((!latitude || !longitude) && !city) {
    return new Response(
      JSON.stringify({ error: "Missing location parameters. Provide either latitude/longitude or city name" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  
  // Validate coordinate ranges if provided
  if (latitude && longitude) {
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
  }
  
  // Validate city name if provided
  if (city && (city.length < 2 || city.length > 50 || !/^[a-zA-Z\s,.-]+$/.test(city))) {
    return new Response(
      JSON.stringify({ error: "Invalid city name. Must be between 2 and 50 characters and contain only letters, spaces, commas, periods, and hyphens." }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  
  // Limit days to reasonable range (1-7)
  const safeDays = Math.max(1, Math.min(7, days));
  
  // Build API URL based on provided parameters
  let apiUrl;
  if (latitude && longitude) {
    apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&cnt=${safeDays * 8}&appid=${WEATHER_API_KEY}`;
  } else {
    apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&cnt=${safeDays * 8}&appid=${WEATHER_API_KEY}`;
  }
  
  // Add language parameter for localization
  apiUrl += "&lang=en"; // Default to English
  
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  if (data.cod !== "200") {
    return new Response(
      JSON.stringify({ error: "Forecast data not found", details: data.message }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  
  // Group forecast data by day
  const forecastByDay = {};
  
  data.list.forEach(item => {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0];
    
    if (!forecastByDay[date]) {
      forecastByDay[date] = {
        date,
        timestamps: [],
      };
    }
    
    // Only include essential data points
    forecastByDay[date].timestamps.push({
      time: new Date(item.dt * 1000).toISOString(),
      temperature: item.main.temp,
      feelsLike: item.main.feels_like,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      condition: item.weather[0].main,
    });
  });
  
  // Convert to array and calculate daily summary
  const forecast = Object.values(forecastByDay).map(day => {
    const timestamps = day.timestamps;
    
    // Calculate min/max/avg temperature
    const temperatures = timestamps.map(t => t.temperature);
    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);
    const avgTemp = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
    
    // Get most common condition
    const conditionCounts = {};
    timestamps.forEach(t => {
      conditionCounts[t.condition] = (conditionCounts[t.condition] || 0) + 1;
    });
    
    let mostCommonCondition = '';
    let maxCount = 0;
    
    Object.entries(conditionCounts).forEach(([condition, count]) => {
      if (count > maxCount) {
        mostCommonCondition = condition;
        maxCount = count;
      }
    });
    
    // Get icon for the most common condition during daytime
    const daytimeTimestamps = timestamps.filter(t => {
      const hour = new Date(t.time).getHours();
      return hour >= 8 && hour <= 18;
    });
    
    const icon = daytimeTimestamps.length > 0
      ? daytimeTimestamps[Math.floor(daytimeTimestamps.length / 2)].icon
      : timestamps[0].icon;
    
    return {
      date: day.date,
      summary: {
        minTemperature: minTemp,
        maxTemperature: maxTemp,
        avgTemperature: avgTemp,
        condition: mostCommonCondition,
        icon,
      },
      // Limit hourly data to reduce payload size
      hourly: timestamps.filter((_, index) => index % 2 === 0), // Every other timestamp
    };
  });
  
  return new Response(
    JSON.stringify({
      location: {
        name: data.city.name,
        country: data.city.country,
        latitude: data.city.coord.lat,
        longitude: data.city.coord.lon,
      },
      forecast,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}