import { channelManager } from './channelManager';
import { logger } from './logger';

// Data isolation utilities
class DataIsolation {
  private static instance: DataIsolation;
  private testingData: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): DataIsolation {
    if (!DataIsolation.instance) {
      DataIsolation.instance = new DataIsolation();
    }
    return DataIsolation.instance;
  }

  // Store data with channel isolation
  storeData(key: string, data: any): void {
    try {
      if (channelManager.isTestingChannel()) {
        // Store in memory for testing channel
        this.testingData.set(key, data);
        logger.debug('Stored testing data:', { key });
      } else {
        // Store in localStorage for production channel
        localStorage.setItem(key, JSON.stringify(data));
        logger.debug('Stored production data:', { key });
      }
    } catch (error) {
      logger.error('Error storing data:', error);
      throw error;
    }
  }

  // Retrieve data with channel isolation
  getData(key: string): any {
    try {
      if (channelManager.isTestingChannel()) {
        // Get from memory for testing channel
        return this.testingData.get(key);
      } else {
        // Get from localStorage for production channel
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }
    } catch (error) {
      logger.error('Error retrieving data:', error);
      throw error;
    }
  }

  // Clear data with channel isolation
  clearData(key: string): void {
    try {
      if (channelManager.isTestingChannel()) {
        // Clear from memory for testing channel
        this.testingData.delete(key);
        logger.debug('Cleared testing data:', { key });
      } else {
        // Clear from localStorage for production channel
        localStorage.removeItem(key);
        logger.debug('Cleared production data:', { key });
      }
    } catch (error) {
      logger.error('Error clearing data:', error);
      throw error;
    }
  }

  // Clear all data for current channel
  clearAllData(): void {
    try {
      if (channelManager.isTestingChannel()) {
        // Clear all testing data
        this.testingData.clear();
        logger.info('Cleared all testing data');
      } else {
        // Clear all production data
        localStorage.clear();
        logger.info('Cleared all production data');
      }
    } catch (error) {
      logger.error('Error clearing all data:', error);
      throw error;
    }
  }

  // Reset testing data after session
  resetTestingData(): void {
    if (channelManager.isTestingChannel()) {
      this.testingData.clear();
      logger.info('Reset testing data');
    }
  }
}

// Export singleton instance
export const dataIsolation = DataIsolation.getInstance();