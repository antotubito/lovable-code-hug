import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log environment variables for debugging
logger.info('Supabase configuration:', { 
  urlAvailable: !!supabaseUrl, 
  keyAvailable: !!supabaseAnonKey,
  url: supabaseUrl
});

// Create Supabase client with improved configuration
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    flowType: 'pkce',
    debug: import.meta.env.DEV
  },
  global: {
    headers: {
      'x-application-name': 'dislink',
      'x-environment': import.meta.env.MODE
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Initialize connection
export const initializeConnection = async (): Promise<void> => {
  try {
    // Check if credentials are available
    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('Missing Supabase credentials. Please check your .env file.');
      return;
    }

    // Try to recover any existing session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      if (error.message?.includes('Invalid API key')) {
        logger.error('Invalid Supabase API key. Please check your credentials.');
      } else {
        logger.error('Error getting session:', error);
      }
      return;
    }
    
    if (session) {
      logger.info('Existing session found');
      
      // Calculate time until session expires
      const expiresAt = new Date(session.expires_at!).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      // If session expires soon (within 5 minutes), refresh it
      if (timeUntilExpiry < 5 * 60 * 1000) {
        logger.info('Session expiring soon, refreshing');
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          logger.error('Error refreshing session:', refreshError);
        }
      }
    } else {
      logger.info('No session found');
    }
  } catch (error) {
    logger.error('Error initializing connection:', error);
    // Don't throw the error, just log it
  }
};

// Export helper to check connection status
export const checkConnection = async (): Promise<boolean> => {
  try {
    // Check if credentials are available
    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('Missing Supabase credentials');
      return false;
    }

    const { data, error } = await supabase.auth.getSession();
    if (error) {
      if (error.message?.includes('Invalid API key')) {
        logger.error('Invalid Supabase API key detected during connection check');
      } else {
        logger.error('Connection check failed:', error);
      }
      return false;
    }
    return Boolean(data.session);
  } catch (error) {
    logger.error('Connection check failed:', error);
    return false;
  }
};

// Retry connection with exponential backoff
export const retryConnection = async (maxRetries = 3): Promise<boolean> => {
  let retries = 0;
  
  // Check if credentials are available
  if (!supabaseUrl || !supabaseAnonKey) {
    logger.error('Cannot retry connection: Missing Supabase credentials');
    return false;
  }
  
  while (retries < maxRetries) {
    try {
      logger.info(`Attempting to reconnect to Supabase (attempt ${retries + 1}/${maxRetries})`);
      await initializeConnection();
      const connected = await checkConnection();
      
      if (connected) {
        logger.info('Successfully reconnected to Supabase');
        return true;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, retries) * 1000;
      logger.info(`Connection attempt failed, retrying in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
    } catch (error) {
      logger.error(`Reconnection attempt ${retries + 1} failed:`, error);
      retries++;
      
      if (retries >= maxRetries) {
        logger.error('Max retries reached, giving up');
        return false;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, retries) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return false;
};

// Initialize connection on load
initializeConnection().then(() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    logger.error('❌ Supabase initialization failed: Missing credentials in .env file');
    return;
  }
  logger.info('✅ Supabase connection initialized');
}).catch(error => {
  logger.error('❌ Supabase connection initialization failed:', error);
});