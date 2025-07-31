export interface User {
  id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  name: string;
  jobTitle?: string;
  company?: string;
  industry?: string;
  profileImage?: string;
  coverImage?: string;
  bio?: {
    location?: string;
    from?: string;
    about?: string;
  };
  interests?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    medium?: string;
    dribbble?: string;
    portfolio?: string;
    [key: string]: string | undefined;
  };
  publicProfile: {
    enabled: boolean;
    defaultSharedLinks: Record<string, boolean>;
    allowedFields: {
      email: boolean;
      phone: boolean;
      company: boolean;
      jobTitle: boolean;
      bio: boolean;
      interests: boolean;
      location: boolean;
    };
  };
  twoFactorEnabled: boolean;
  registrationComplete?: boolean;
  registrationStatus?: 'pending' | 'in_progress' | 'completed' | 'verified';
  registrationCompletedAt?: Date;
  onboardingComplete?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  company?: string;
  qrCode?: string;
  emailRedirectTo?: string;
}

export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  company?: string;
  accessKey: string;
  approved: boolean;
  requestDate: Date;
  approvalDate?: Date;
}