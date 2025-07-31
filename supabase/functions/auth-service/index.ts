import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

// CORS headers - restrict to your application domain in production
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // In production, replace with your domain
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS", // Only allow POST and OPTIONS
};

// Rate limiting configuration
const RATE_LIMITS = {
  login: { maxRequests: 5, perMinute: true },
  signup: { maxRequests: 3, perMinute: true },
  resetPassword: { maxRequests: 2, perMinute: true },
  verifyEmail: { maxRequests: 3, perMinute: true }
};

// In-memory rate limiting (would use Redis in production)
const requestCounts = {};

// Check if request exceeds rate limits
function checkRateLimit(action: string, clientIp: string): boolean {
  const now = Date.now();
  const key = `${action}:${clientIp}`;
  
  if (!requestCounts[key]) {
    requestCounts[key] = { 
      count: 0, 
      resetAt: now + (RATE_LIMITS[action].perMinute ? 60000 : 3600000) 
    };
  }
  
  // Reset counter if time expired
  if (now > requestCounts[key].resetAt) {
    requestCounts[key] = { 
      count: 0, 
      resetAt: now + (RATE_LIMITS[action].perMinute ? 60000 : 3600000) 
    };
  }
  
  // Check if limit exceeded
  if (requestCounts[key].count >= RATE_LIMITS[action].maxRequests) {
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

  // Only allow POST requests for security
  if (req.method !== "POST") {
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
    const action = url.pathname.split("/").pop();

    // Create Supabase client with service role key (minimal permissions)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get request body
    const requestData = await req.json();

    // Handle different auth actions
    switch (action) {
      case "login":
        // Check rate limit
        if (!checkRateLimit("login", clientIp)) {
          return new Response(
            JSON.stringify({ 
              error: "Too many login attempts. Please try again later.",
              code: "rate_limit_exceeded"
            }),
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
        
        // Validate input
        if (!requestData.email || !requestData.password) {
          return new Response(
            JSON.stringify({ error: "Email and password are required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requestData.email)) {
          return new Response(
            JSON.stringify({ error: "Invalid email format" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Perform login
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: requestData.email,
          password: requestData.password,
        });
        
        if (loginError) {
          // Don't expose specific error details for security
          return new Response(
            JSON.stringify({ 
              error: "Invalid login credentials",
              code: "invalid_credentials"
            }),
            {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            session: {
              access_token: loginData.session.access_token,
              refresh_token: loginData.session.refresh_token,
              expires_at: loginData.session.expires_at
            },
            user: {
              id: loginData.user.id,
              email: loginData.user.email,
              // Only include essential user data
            }
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
        
      case "signup":
        // Check rate limit
        if (!checkRateLimit("signup", clientIp)) {
          return new Response(
            JSON.stringify({ 
              error: "Too many signup attempts. Please try again later.",
              code: "rate_limit_exceeded"
            }),
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
        
        // Validate input
        if (!requestData.email || !requestData.password || !requestData.firstName || !requestData.lastName) {
          return new Response(
            JSON.stringify({ error: "Email, password, first name, and last name are required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requestData.email)) {
          return new Response(
            JSON.stringify({ error: "Invalid email format" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Validate password strength
        if (requestData.password.length < 8) {
          return new Response(
            JSON.stringify({ error: "Password must be at least 8 characters long" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Perform signup
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: requestData.email,
          password: requestData.password,
          options: {
            data: {
              first_name: requestData.firstName,
              middle_name: requestData.middleName,
              last_name: requestData.lastName,
              company: requestData.company,
              onboarding_complete: false,
              registration_complete: false,
              registration_status: 'pending'
            },
            emailRedirectTo: requestData.redirectUrl || `${url.origin}/verify`
          }
        });
        
        if (signupError) {
          return new Response(
            JSON.stringify({ error: signupError.message }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            user: {
              id: signupData.user.id,
              email: signupData.user.email,
              // Only include essential user data
            },
            session: signupData.session,
            message: "Verification email sent. Please check your inbox."
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
        
      case "reset-password":
        // Check rate limit
        if (!checkRateLimit("resetPassword", clientIp)) {
          return new Response(
            JSON.stringify({ 
              error: "Too many password reset attempts. Please try again later.",
              code: "rate_limit_exceeded"
            }),
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
        
        // Validate input
        if (!requestData.email) {
          return new Response(
            JSON.stringify({ error: "Email is required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requestData.email)) {
          return new Response(
            JSON.stringify({ error: "Invalid email format" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Send password reset email
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          requestData.email,
          {
            redirectTo: requestData.redirectUrl || `${url.origin}/reset-password`
          }
        );
        
        // For security, always return success even if email doesn't exist
        return new Response(
          JSON.stringify({ 
            message: "If an account exists with this email, you will receive password reset instructions."
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
        
      case "verify-email":
        // Check rate limit
        if (!checkRateLimit("verifyEmail", clientIp)) {
          return new Response(
            JSON.stringify({ 
              error: "Too many verification attempts. Please try again later.",
              code: "rate_limit_exceeded"
            }),
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
        
        // Validate input
        if (!requestData.token || !requestData.type) {
          return new Response(
            JSON.stringify({ error: "Token and type are required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Verify email
        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: requestData.token,
          type: requestData.type,
          email: requestData.email
        });
        
        if (verifyError) {
          return new Response(
            JSON.stringify({ error: verifyError.message }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            session: verifyData.session,
            message: "Email verified successfully"
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
        
      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }
  } catch (error) {
    console.error("Auth service error:", error);
    
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