export interface QRCodeData {
  c: string; // code
  n?: string; // name (optional)
  j?: string; // job title (optional)
  o?: string; // organization/company (optional)
  p?: string; // profile image (optional)
  t: number; // timestamp
}

export interface QRScanResult {
  userId: string;
  name: string;
  jobTitle?: string;
  company?: string;
  profileImage?: string;
  publicProfile?: any;
  bio?: any;
  socialLinks?: any;
  interests?: string[];
  isExpired: boolean;
  code?: string; // Added to store the original code
  codeId?: string; // Added to store the code ID for connection requests
}

export interface ConnectionRequest {
  id: string;
  userId: string;
  requesterId: string;
  codeId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}

export interface QRCode {
  id: string;
  userId: string;
  code: string;
  scannedAt?: Date;
  scannedBy?: string;
  location?: {
    latitude: number;
    longitude: number;
    scannedAt: Date;
  };
  status: 'active' | 'used' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

export interface ConnectionData {
  success: boolean;
  message: string;
  connectionId?: string;
}