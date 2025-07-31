import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, Scan, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QrScanner from 'qr-scanner';
import { validateQRCode, trackQRCodeScan } from '../../lib/qr';
import { ConnectionConfirmation } from './ConnectionConfirmation';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan?: (data: string) => void;
}

export function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Try to get user's current location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            name: 'Current Location'
          });
          
          // Now initialize the scanner
          initializeScanner();
        },
        (error) => {
          console.error('Error getting location:', error);
          // Continue without location
          initializeScanner();
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      // Clean up scanner when modal closes
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
      setIsScanning(false);
      setScanSuccess(false);
    }
  }, [isOpen]);

  const initializeScanner = () => {
    if (!videoRef.current) return;
    
    // Request camera permission
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(() => {
        setHasPermission(true);
        setError(null);

        // Initialize QR scanner
        const qrScanner = new QrScanner(
          videoRef.current!,
          async result => {
            try {
              setIsScanning(false);
              setScanSuccess(true);
              
              // Parse the QR code data
              const qrResult = await validateQRCode(result.data);
              
              if (!qrResult) {
                throw new Error('Invalid QR code');
              }
              
              // Track the scan with location data
              if (location) {
                await trackQRCodeScan(qrResult.code!, {
                  latitude: location.latitude,
                  longitude: location.longitude
                });
              }
              
              // Store scanned data
              setScannedData(qrResult);
              
              // Show confirmation dialog
              setShowConfirmation(true);
              
              // Stop scanning
              if (scannerRef.current) {
                scannerRef.current.stop();
              }
              
              // Call onScan callback if provided
              if (onScan) {
                onScan(result.data);
              }
            } catch (err) {
              console.error('Error processing QR code:', err);
              setError('Invalid QR code');
              
              // Resume scanning after error
              setTimeout(() => {
                setIsScanning(true);
                if (scannerRef.current) {
                  scannerRef.current.start();
                }
              }, 2000);
            }
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );

        scannerRef.current = qrScanner;
        qrScanner.start();
        setIsScanning(true);
      })
      .catch(err => {
        console.error('Camera error:', err);
        setError('Unable to access camera. Please make sure you have granted camera permissions.');
        setHasPermission(false);
      });
  };

  const handleConfirm = async () => {
    if (!scannedData) return;

    try {
      // Close scanner and confirmation
      setShowConfirmation(false);
      onClose();
    } catch (error) {
      console.error('Error creating connection request:', error);
      setError('Failed to create connection request');
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl overflow-hidden max-w-lg w-full"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Scan QR Code</h3>
                    <p className="text-sm text-gray-500">
                      Point your camera at someone's QR code to connect
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Scanner */}
              <div className="relative aspect-square bg-black">
                {hasPermission ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                    />
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-64 border-2 border-white/50 rounded-lg">
                        {isScanning && (
                          <div className="absolute inset-0 border-2 border-indigo-500 rounded-lg animate-pulse" />
                        )}
                        {scanSuccess && (
                          <div className="absolute inset-0 border-2 border-green-500 rounded-lg" />
                        )}
                      </div>
                    </div>
                    
                    {/* Location indicator */}
                    {location && (
                      <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm p-2 rounded-lg">
                        <div className="flex items-center text-white text-sm">
                          <Navigation className="h-4 w-4 mr-2 text-indigo-400" />
                          <span>GPS Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Error message */}
                    {error && (
                      <div className="absolute top-4 left-4 right-4 bg-red-500/80 backdrop-blur-sm p-2 rounded-lg">
                        <p className="text-white text-sm">{error}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-4">
                      <Camera className="h-12 w-12 text-white mx-auto mb-4" />
                      <p className="text-white text-sm mb-4">
                        {error || 'Requesting camera access...'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50">
                <p className="text-sm text-gray-600 text-center">
                  Make sure the QR code is within the frame and well-lit
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Confirmation */}
      {scannedData && (
        <ConnectionConfirmation
          isOpen={showConfirmation}
          onClose={() => {
            setShowConfirmation(false);
            onClose();
          }}
          onConfirm={handleConfirm}
          user={scannedData}
          location={location}
        />
      )}
    </>
  );
}