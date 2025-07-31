import React, { useRef, useState } from 'react';
import { Upload, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FaceVerificationProps {
  onVerified: (photoData: string) => void;
  onError: (error: string) => void;
}

export function FaceVerification({ onVerified, onError }: FaceVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    onError('');

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }

      // Create an image element for validation
      const img = new Image();
      const reader = new FileReader();

      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          img.src = reader.result;
          img.onload = async () => {
            try {
              // Set preview image
              setPreviewImage(reader.result);
              // Notify parent component
              onVerified(reader.result);
              setError(null);
              onError('');
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to process image');
              onError(err instanceof Error ? err.message : 'Failed to process image');
              setPreviewImage(null);
            } finally {
              setLoading(false);
            }
          };
          img.onerror = () => {
            setError('Failed to load image');
            onError('Failed to load image');
            setLoading(false);
            setPreviewImage(null);
          };
        }
      };
      reader.onerror = () => {
        throw new Error('Failed to read image file');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the image');
      onError(err instanceof Error ? err.message : 'An error occurred while processing the image');
      setLoading(false);
      setPreviewImage(null);
    }
    
    // Clear input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setPreviewImage(null);
    onVerified('');
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <AnimatePresence>
          {previewImage ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative"
            >
              <img
                src={previewImage}
                alt="Profile preview"
                className="h-48 w-48 rounded-xl object-cover mx-auto"
              />
              <button
                onClick={handleRemovePhoto}
                className="absolute top-2 right-2 p-1 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                title="Remove photo"
              >
                <X className="h-4 w-4 text-red-600" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                Change Photo
              </button>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="flex-1 h-48 w-48 mx-auto rounded-xl bg-gray-100 flex flex-col items-center justify-center hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
            >
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Upload Photo</span>
            </motion.button>
          )}
        </AnimatePresence>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {error && (
        <div className="flex items-start space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Please provide a clear photo. The photo will be visible to your connections.
      </p>
    </div>
  );
}