import { env, isTestingEnvironment, isProductionEnvironment } from '../config/environment';
import { logger } from './logger';

// Channel types
export type Channel = 'production' | 'testing';

// Channel manager class
class ChannelManager {
  private static instance: ChannelManager;
  private currentChannel: Channel | null = null;

  private constructor() {}

  static getInstance(): ChannelManager {
    if (!ChannelManager.instance) {
      ChannelManager.instance = new ChannelManager();
    }
    return ChannelManager.instance;
  }

  // Initialize channel based on auth token
  initializeChannel(token?: string | null): Channel {
    if (isTestingEnvironment(token)) {
      this.currentChannel = 'testing';
      logger.info('Initialized testing channel');
    } else if (isProductionEnvironment(token)) {
      this.currentChannel = 'production';
      logger.info('Initialized production channel');
    } else {
      this.currentChannel = null;
      logger.debug('No channel initialized - user not authenticated');
    }

    return this.currentChannel as Channel;
  }

  // Get current channel
  getCurrentChannel(): Channel | null {
    return this.currentChannel;
  }

  // Check if in testing channel
  isTestingChannel(): boolean {
    return this.currentChannel === 'testing';
  }

  // Check if in production channel
  isProductionChannel(): boolean {
    return this.currentChannel === 'production';
  }

  // Reset channel
  resetChannel(): void {
    this.currentChannel = null;
    logger.info('Channel reset');
  }

  // Get channel configuration
  getChannelConfig() {
    if (!this.currentChannel) {
      throw new Error('No channel initialized');
    }
    return env.channels[this.currentChannel];
  }

  // Validate channel access
  validateChannelAccess(token: string): boolean {
    if (isTestingEnvironment(token)) {
      return token === env.TEST_CREDENTIALS.DISLINK_USER || 
             token === env.TEST_CREDENTIALS.TEST_USER;
    }
    
    if (isProductionEnvironment(token)) {
      return token === env.ACCESS_PASSWORD;
    }
    
    return false;
  }
}

// Export singleton instance
export const channelManager = ChannelManager.getInstance();