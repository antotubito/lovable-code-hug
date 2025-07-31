import { z } from 'zod';

// Environment configuration schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  IN_DEVELOPMENT: z.boolean().default(false),
  ACCESS_PASSWORD: z.string().default('ITHINKWEMET2025'),
  TEST_CREDENTIALS: z.object({
    DISLINK_USER: z.string().default('DISLINK_USER_2024'),
    TEST_USER: z.string().default('TEST_USER_1_2025')
  }),
  SUPABASE: z.object({
    URL: z.string().default(''),
    ANON_KEY: z.string().default('')
  })
});

// Environment configuration
export const env = envSchema.parse({
  NODE_ENV: import.meta.env.MODE,
  IN_DEVELOPMENT: false,
  ACCESS_PASSWORD: 'ITHINKWEMET2025',
  TEST_CREDENTIALS: {
    DISLINK_USER: 'DISLINK_USER_2024',
    TEST_USER: 'TEST_USER_1_2025'
  },
  SUPABASE: {
    URL: import.meta.env.VITE_SUPABASE_URL || '',
    ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  }
});

// Environment type guards
export const isTestingEnvironment = (token?: string | null): boolean => {
  if (!token) return false;
  return token === env.TEST_CREDENTIALS.DISLINK_USER || 
         token === env.TEST_CREDENTIALS.TEST_USER;
};

export const isProductionEnvironment = (token?: string | null): boolean => {
  if (!token) return false;
  return token === env.ACCESS_PASSWORD;
};

// Channel-specific configuration
export const channels = {
  production: {
    name: 'Production',
    requiresAccessPassword: true,
    requiresEmailVerification: true,
    dataRetention: 'permanent',
    features: {
      qrCode: true,
      contacts: true,
      notes: true,
      followUps: true,
      locationTracking: true
    }
  },
  testing: {
    name: 'Testing',
    requiresAccessPassword: false,
    requiresEmailVerification: false,
    dataRetention: 'temporary',
    features: {
      qrCode: true,
      contacts: true,
      notes: true,
      followUps: true,
      locationTracking: true
    }
  }
} as const;

// Feature flags
export const features = {
  emailVerification: true,
  accessPasswordGate: true,
  testingChannel: true,
  dataIsolation: true,
  sessionPersistence: true
} as const;

// Security settings
export const security = {
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  requireEmailVerification: true,
  requireAccessPassword: true,
  productionAccessPassword: env.ACCESS_PASSWORD,
  testingAccessKeys: Object.values(env.TEST_CREDENTIALS)
} as const;

// Data retention policies
export const dataRetention = {
  testData: {
    duration: 24 * 60 * 60 * 1000, // 24 hours
    autoCleanup: true
  },
  productionData: {
    duration: 'permanent',
    backupFrequency: 24 * 60 * 60 * 1000 // 24 hours
  }
} as const;

// Environment validation
export function validateEnvironment() {
  // Check required environment variables
  if (!env.SUPABASE.URL || !env.SUPABASE.ANON_KEY) {
    console.error('Missing required Supabase environment variables');
    return false;
  }

  // Check production requirements
  if (env.NODE_ENV === 'production') {
    if (!env.ACCESS_PASSWORD) {
      console.error('Production access password not configured');
      return false;
    }
    if (!features.accessPasswordGate) {
      console.error('Access password gate must be enabled in production');
      return false;
    }
    if (!features.emailVerification) {
      console.error('Email verification must be enabled in production');
      return false;
    }
  }

  return true;
}

// Initialize environment
validateEnvironment();