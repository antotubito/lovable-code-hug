/**
 * Mobile utilities for handling platform-specific functionality
 */

// Check if the app is running in a mobile environment
export const isMobileApp = (): boolean => {
  return window.location.protocol === 'capacitor:' || 
         window.location.protocol === 'ionic:' ||
         !!window.Capacitor;
};

// Check if the app is running on iOS
export const isIOS = (): boolean => {
  if (!isMobileApp()) return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /iPhone|iPad|iPod/i.test(userAgent) && !window.MSStream;
};

// Check if the app is running on Android
export const isAndroid = (): boolean => {
  if (!isMobileApp()) return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /android/i.test(userAgent);
};

// Get the app version
export const getAppVersion = async (): Promise<string> => {
  if (!isMobileApp()) return 'web';
  
  try {
    const { App } = await import('@capacitor/app');
    const info = await App.getInfo();
    return info.version;
  } catch (error) {
    console.error('Error getting app version:', error);
    return 'unknown';
  }
};

// Open app settings
export const openAppSettings = async (): Promise<void> => {
  if (!isMobileApp()) return;
  
  try {
    const { App } = await import('@capacitor/app');
    await App.openSettings();
  } catch (error) {
    console.error('Error opening app settings:', error);
  }
};

// Request permissions (camera, location, etc.)
export const requestPermission = async (permission: 'camera' | 'location'): Promise<boolean> => {
  if (!isMobileApp()) return true;
  
  try {
    if (permission === 'camera') {
      const { Camera } = await import('@capacitor/camera');
      const result = await Camera.requestPermissions();
      return result.camera === 'granted';
    } else if (permission === 'location') {
      const { Geolocation } = await import('@capacitor/geolocation');
      const result = await Geolocation.requestPermissions();
      return result.location === 'granted';
    }
    return false;
  } catch (error) {
    console.error(`Error requesting ${permission} permission:`, error);
    return false;
  }
};

// Share content using the native share dialog
export const shareContent = async (options: { 
  title?: string; 
  text?: string; 
  url?: string;
}): Promise<void> => {
  if (!isMobileApp()) {
    // Fallback for web
    if (navigator.share) {
      await navigator.share(options);
    } else {
      if (options.url) {
        await navigator.clipboard.writeText(options.url);
        alert('Link copied to clipboard!');
      }
    }
    return;
  }
  
  try {
    const { Share } = await import('@capacitor/share');
    await Share.share(options);
  } catch (error) {
    console.error('Error sharing content:', error);
    
    // Fallback to clipboard
    if (options.url) {
      const { Clipboard } = await import('@capacitor/clipboard');
      await Clipboard.write({
        string: options.url
      });
      alert('Link copied to clipboard!');
    }
  }
};

// Get current device location
export const getCurrentLocation = async (): Promise<{ 
  latitude: number; 
  longitude: number;
} | null> => {
  try {
    if (isMobileApp()) {
      const { Geolocation } = await import('@capacitor/geolocation');
      const position = await Geolocation.getCurrentPosition();
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    } else {
      // Web fallback
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            console.error('Error getting location:', error);
            reject(error);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
    }
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

// Add device information to analytics events
export const getDeviceInfo = async (): Promise<{
  platform: string;
  model: string;
  operatingSystem: string;
  osVersion: string;
  manufacturer: string;
  isVirtual: boolean;
  webViewVersion: string;
}> => {
  if (!isMobileApp()) {
    return {
      platform: 'web',
      model: 'browser',
      operatingSystem: navigator.platform,
      osVersion: navigator.userAgent,
      manufacturer: 'unknown',
      isVirtual: false,
      webViewVersion: navigator.userAgent
    };
  }
  
  try {
    const { Device } = await import('@capacitor/device');
    const info = await Device.getInfo();
    return info;
  } catch (error) {
    console.error('Error getting device info:', error);
    return {
      platform: 'unknown',
      model: 'unknown',
      operatingSystem: 'unknown',
      osVersion: 'unknown',
      manufacturer: 'unknown',
      isVirtual: false,
      webViewVersion: 'unknown'
    };
  }
};

// Check if the app has network connectivity
export const hasNetworkConnection = async (): Promise<boolean> => {
  if (!isMobileApp()) {
    return navigator.onLine;
  }
  
  try {
    const { Network } = await import('@capacitor/network');
    const status = await Network.getStatus();
    return status.connected;
  } catch (error) {
    console.error('Error checking network status:', error);
    return navigator.onLine;
  }
};

// Add a listener for network status changes
export const addNetworkListener = async (
  callback: (isConnected: boolean) => void
): Promise<() => void> => {
  if (!isMobileApp()) {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
  
  try {
    const { Network } = await import('@capacitor/network');
    
    const listener = await Network.addListener('networkStatusChange', (status) => {
      callback(status.connected);
    });
    
    return () => {
      listener.remove();
    };
  } catch (error) {
    console.error('Error adding network listener:', error);
    return () => {};
  }
};

// Vibrate the device
export const vibrate = async (pattern: number | number[] = 100): Promise<void> => {
  if (!isMobileApp()) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
    return;
  }
  
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    
    if (typeof pattern === 'number') {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else {
      // For complex patterns, use multiple impacts
      for (const duration of pattern) {
        await Haptics.impact({ style: ImpactStyle.Medium });
        if (duration > 0) {
          await new Promise(resolve => setTimeout(resolve, duration));
        }
      }
    }
  } catch (error) {
    console.error('Error vibrating device:', error);
  }
};

// Show a native toast message
export const showToast = async (message: string, duration: 'short' | 'long' = 'short'): Promise<void> => {
  if (!isMobileApp()) {
    // Simple web fallback
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '20px';
    toast.style.zIndex = '9999';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s ease';
      
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 500);
    }, duration === 'short' ? 2000 : 3500);
    
    return;
  }
  
  try {
    const { Toast } = await import('@capacitor/toast');
    await Toast.show({
      text: message,
      duration: duration === 'short' ? 'short' : 'long'
    });
  } catch (error) {
    console.error('Error showing toast:', error);
  }
};

// Take a photo using the device camera
export const takePhoto = async (): Promise<string | null> => {
  if (!isMobileApp()) {
    console.warn('Camera functionality is only available in the mobile app');
    return null;
  }
  
  try {
    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
    
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });
    
    return image.dataUrl || null;
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

// Scan a QR code using the device camera
export const scanQRCode = async (): Promise<string | null> => {
  if (!isMobileApp()) {
    console.warn('QR scanning is optimized for the mobile app');
    return null;
  }
  
  try {
    const { BarcodeScanner } = await import('@capacitor-community/barcode-scanner');
    
    // Make background transparent
    document.querySelector('body')?.classList.add('transparent-background');
    
    // Start scanning
    await BarcodeScanner.startScan();
    
    // Wait for scan result
    const result = await BarcodeScanner.startScan();
    
    // Restore background
    document.querySelector('body')?.classList.remove('transparent-background');
    
    if (result.hasContent) {
      return result.content;
    }
    
    return null;
  } catch (error) {
    console.error('Error scanning QR code:', error);
    document.querySelector('body')?.classList.remove('transparent-background');
    return null;
  }
};

// Exit the app (Android only)
export const exitApp = async (): Promise<void> => {
  if (!isMobileApp() || !isAndroid()) {
    console.warn('Exit app is only available on Android');
    return;
  }
  
  try {
    const { App } = await import('@capacitor/app');
    await App.exitApp();
  } catch (error) {
    console.error('Error exiting app:', error);
  }
};