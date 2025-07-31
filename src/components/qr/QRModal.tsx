import React, { useState, useEffect } from 'react';
import { X, QrCode, Copy, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { QRCode } from './QRCode';
import type { User } from '../../types/user';
import { generateQRCode, getPublicProfileUrl } from '../../lib/qr';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function QRModal({ isOpen, onClose, user }: QRModalProps) {
  const [qrData, setQrData] = useState<string>('');
  const [qrDownloaded, setQrDownloaded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen && user?.id) { 
      generateQRCode(user.id)
        .then(data => {
          setQrData(data);
          
          // Extract the connection code from the QR data
          try {
            const parsedData = JSON.parse(data);
            if (parsedData && parsedData.c) {
              const publicProfileUrl = getPublicProfileUrl(parsedData.c);
              setPublicUrl(publicProfileUrl);
            }
          } catch (err) {
            console.error('Error parsing QR data:', err);
          }
          
          setLoading(false);
        })
        .catch(err => {
          console.error('Error generating QR code:', err);
          setError('Failed to generate QR code');
          setLoading(false);
        });
    }
  }, [isOpen, user?.id]);

  // Animation controls for success feedback
  const copyControls = useAnimation();
  const downloadControls = useAnimation();
  
  const animateSuccess = async (control) => {
    await control.start({ 
      scale: [1, 1.2, 1],
      backgroundColor: ['#4F46E5', '#10B981', '#4F46E5'],
      transition: { duration: 0.5 }
    });
  };

  const handleCopyLink = async () => {
    try {
      const profileUrl = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: `Connect with ${user.name} on Dislink`,
          text: `Scan this QR code to connect with me on Dislink!`,
          url: profileUrl
        });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        setCopySuccess(true);
        await animateSuccess(copyControls);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (err) {
      console.error('Error copying link:', err);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Connect with ${user.name} on Dislink`,
          text: `Scan this QR code to connect with me on Dislink!`,
          url: publicUrl
        });
      } else {
        handleCopyLink();
      }
    } catch (err) {
      console.error('Error sharing:', err);
      // Fall back to copy if sharing fails
      handleCopyLink();
    }
  };

  const handleDownload = () => {
    try {
      const svgElement = document.getElementById('qr-code-svg');
      if (!svgElement) {
        throw new Error('QR code element not found');
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      const scale = 3;
      canvas.width = 256 * scale;
      canvas.height = 256 * scale;

      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        const link = document.createElement('a');
        link.download = `${user.name.toLowerCase().replace(/\s+/g, '-')}-qr-code.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(svgUrl);

        setQrDownloaded(true); 
        animateSuccess(downloadControls);
        setTimeout(() => setQrDownloaded(false), 2000);
      };

      img.src = svgUrl;
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl border border-indigo-100"
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <QrCode className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Your QR Code</h3>
                  <p className="text-sm text-gray-500">Share to connect instantly</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: '#F3F4F6' }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </motion.button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <>
                <QRCode
                  value={qrData}
                  imageSettings={user.profileImage ? {
                    src: user.profileImage,
                    height: 48,
                    width: 48, 
                    excavate: true,
                  } : undefined}
                />

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500 mb-2">
                    Let others scan this code to connect with you instantly
                  </p>
                  
                  {publicUrl && ( 
                    <div className="mt-4 mb-4 p-3 bg-indigo-50 rounded-lg text-sm break-all border border-indigo-100">
                      <p className="font-medium text-indigo-700 mb-1">Public Profile URL:</p>
                      <p className="text-indigo-600">{publicUrl}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-center space-x-3 mt-6">
                    <motion.button
                      animate={copyControls}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopyLink}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"
                    >
                      <Copy className="h-4 w-4 mr-1.5" />
                      {copySuccess ? 'Copied!' : 'Copy Link'}
                    </motion.button>
                    
                    <motion.button
                      animate={downloadControls}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDownload}
                      className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 shadow-sm"
                    >
                      <Download className="h-4 w-4 mr-1.5" />
                      {qrDownloaded ? 'Saved!' : 'Save'}
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}