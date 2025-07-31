import React, { useRef, useState } from 'react';
import { Upload, AlertCircle, X, Camera, Trash } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageData: string) => void;
  onImageRemove: () => void;
  required?: boolean;
  isCover?: boolean;
}

export function ProfileImageUpload({
  currentImage,
  onImageChange,
  onImageRemove,
  required = false,
  isCover = false
}: ProfileImageUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

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
              onImageChange(reader.result);
              setError(null);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to process image');
            } finally {
              setLoading(false);
            }
          };
          img.onerror = () => {
            setError('Failed to load image');
            setLoading(false);
          };
        }
      };
      reader.onerror = () => {
        throw new Error('Failed to read image file');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the image');
      setLoading(false);
    }
    
    // Clear input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        {currentImage ? (
          <div className="relative">
            <img
              src={currentImage}
              alt="Profile"
              className={`${isCover ? 'w-full h-40 object-cover' : 'h-32 w-32 rounded-xl object-cover'}`}
            />
            <div className="absolute bottom-2 right-2 flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                disabled={loading}
              >
                <Upload className="h-4 w-4 text-gray-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onImageRemove}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                disabled={loading}
              >
                <Trash className="h-4 w-4 text-red-600" />
              </motion.button>
            </div>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className={`flex flex-col items-center justify-center hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors ${
              isCover 
                ? 'w-full h-40 rounded-lg' 
                : 'h-32 w-32 rounded-xl'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Camera className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">
              {isCover ? 'Add Cover Photo' : 'Add Profile Photo'}
            </span>
          </motion.button>
        )}
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
        {isCover 
          ? 'A cover photo helps personalize your profile. Recommended size: 1200x400 pixels.'
          : 'Please provide a clear photo. The photo will be visible to your connections.'}
      </p>
    </div>
  );
}