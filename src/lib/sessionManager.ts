import { logger } from './logger';
import Cookies from 'js-cookie';
import { channelManager } from './channelManager';
import { dataIsolation } from './dataIsolation';

class SessionManager {
  private static instance: SessionManager;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    // Initialize session check interval
    setInterval(() => this.checkSessionExpiry(), 60000); // Check every minute
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // Store production session
  storeProductionSession(token: string): void {
    try {
      const expiresAt = Date.now() + this.SESSION_DURATION;
      
      // Store session data
      localStorage.setItem('sb-token', token);
      localStorage.setItem('session_expires_at', expiresAt.toString());
      this.resetLoginAttempts();
      
      // Set secure cookie for additional security
      Cookies.set('session_active', 'true', {
        expires: 1, // 1 day
        secure: true,
        sameSite: 'strict'
      });

      logger.info('Production session stored successfully');
    } catch (error) {
      logger.error('Error storing production session:', { error });
      throw error;
    }
  }

  // Store testing session
  storeTestingSession(token: string): void {
    try {
      localStorage.setItem('auth_token', token);
      this.resetLoginAttempts();
      logger.info('Testing session stored successfully');
    } catch (error) {
      logger.error('Error storing testing session:', { error });
      throw error;
    }
  }

  // Check if user has active session
  hasSession(): boolean {
    try {
      const token = localStorage.getItem('sb-token');
      const sessionCookie = Cookies.get('session_active');
      const expiresAt = localStorage.getItem('session_expires_at');
      
      if (!token) {
        return false;
      }

      // For production, check cookie and expiration
      if (!sessionCookie) {
        return false;
      }

      // Check expiration if it exists
      if (expiresAt) {
        const now = Date.now();
        if (now >= parseInt(expiresAt)) {
          this.clearSession();
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('Error checking session:', { error });
      return false;
    }
  }

  // Clear session data
  clearSession(): void {
    try {
      localStorage.removeItem('sb-token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('session_expires_at');
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('loginLockoutUntil');
      localStorage.removeItem('redirectUrl');
      Cookies.remove('session_active');
      
      // Clear channel-specific data
      dataIsolation.clearAllData();
      channelManager.resetChannel();
      
      logger.info('Session cleared successfully');
    } catch (error) {
      logger.error('Error clearing session:', { error });
      throw error;
    }
  }

  // Record failed login attempt
  recordFailedAttempt(): void {
    try {
      const attempts = Number(localStorage.getItem('loginAttempts') || '0') + 1;
      localStorage.setItem('loginAttempts', attempts.toString());

      if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
        const lockoutUntil = Date.now() + this.LOCKOUT_DURATION;
        localStorage.setItem('loginLockoutUntil', lockoutUntil.toString());
        throw new Error('Account is temporarily locked. Please try again later.');
      }

      const remaining = this.MAX_LOGIN_ATTEMPTS - attempts;
      throw new Error(`Invalid credentials. ${remaining} attempts remaining.`);
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error recording failed attempt:', { message: error.message });
        throw error;
      }
      logger.error('Error recording failed attempt:', { error });
      throw new Error('Failed to record login attempt');
    }
  }

  // Reset login attempts
  resetLoginAttempts(): void {
    try {
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('loginLockoutUntil');
      logger.info('Login attempts reset');
    } catch (error) {
      logger.error('Error resetting login attempts:', { error });
      throw error;
    }
  }

  // Check if account is locked out
  isLockedOut(): boolean {
    try {
      const lockoutUntil = localStorage.getItem('loginLockoutUntil');
      if (!lockoutUntil) return false;

      const now = Date.now();
      const lockoutTime = parseInt(lockoutUntil);

      if (now < lockoutTime) {
        const remainingMinutes = Math.ceil((lockoutTime - now) / 60000);
        throw new Error(`Account is locked. Please try again in ${remainingMinutes} minutes.`);
      }

      // Lockout expired, clear it
      this.resetLoginAttempts();
      return false;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      logger.error('Error checking lockout status:', { error });
      return false;
    }
  }

  // Store redirect URL
  storeRedirectUrl(url: string): void {
    if (!url.startsWith('/app/login') && !url.startsWith('/app/register')) {
      localStorage.setItem('redirectUrl', url);
    }
  }

  // Get redirect URL
  getRedirectUrl(): string | null {
    const url = localStorage.getItem('redirectUrl');
    localStorage.removeItem('redirectUrl');
    return url;
  }

  // Get remaining login attempts
  getRemainingAttempts(): number {
    const attempts = Number(localStorage.getItem('loginAttempts') || '0');
    return Math.max(0, this.MAX_LOGIN_ATTEMPTS - attempts);
  }

  // Check session expiry
  private checkSessionExpiry(): void {
    try {
      const expiresAt = localStorage.getItem('session_expires_at');
      if (expiresAt && Date.now() >= parseInt(expiresAt)) {
        this.clearSession();
        logger.info('Session expired');
        window.location.href = '/app/login';
      }
    } catch (error) {
      logger.error('Error checking session expiry:', { error });
    }
  }

  // Check if access password is verified
  isAccessVerified(): boolean {
    return true; // Always return true to bypass access password verification
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();