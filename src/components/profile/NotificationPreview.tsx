import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, User, Building2, Mail, Phone, Link as LinkIcon, Heart, MapPin, MessageCircle, Check } from 'lucide-react';
import type { User as UserType } from '../../types/user';

interface NotificationPreviewProps {
  user: UserType;
  updatedFields: string[];
  selectedTiers: number[];
  onClose: () => void;
}

export function NotificationPreview({ 
  user, 
  updatedFields, 
  selectedTiers,
  onClose 
}: NotificationPreviewProps) {
  // Get tier names based on selected tiers
  const getTierNames = () => {
    const tierNames = [];
    if (selectedTiers.includes(1)) tierNames.push('Inner Circle');
    if (selectedTiers.includes(2)) tierNames.push('Middle Circle');
    if (selectedTiers.includes(3)) tierNames.push('Outer Circle');
    
    if (tierNames.length === 0) return 'No circles selected';
    if (tierNames.length === 3) return 'All circles';
    
    return tierNames.join(', ');
  };

  // Format field names for display
  const formatFieldName = (field: string) => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        return 'Name';
      case 'jobTitle':
        return 'Job Title';
      case 'company':
        return 'Company';
      case 'bio.location':
        return 'Location';
      case 'bio.from':
        return 'Hometown';
      case 'bio.about':
        return 'Bio';
      case 'socialLinks':
        return 'Social Links';
      case 'interests':
        return 'Interests';
      default:
        return field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
    }
  };

  // Get icon for field
  const getFieldIcon = (field: string) => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        return User;
      case 'jobTitle':
      case 'company':
        return Building2;
      case 'email':
        return Mail;
      case 'phone':
        return Phone;
      case 'socialLinks':
        return LinkIcon;
      case 'bio.location':
      case 'location':
        return MapPin;
      case 'bio.about':
        return MessageCircle;
      case 'interests':
        return Heart;
      default:
        return Bell;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-white border border-gray-200 rounded-lg shadow-lg p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-2 rounded-full shadow-sm">
            <Bell className="h-5 w-5 text-indigo-600" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Notification Preview</h3>
            <p className="text-xs text-gray-500">How your connections will see updates</p>
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">Profile Update Notification</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-6 bg-indigo-50 p-3 rounded-lg">
        <p className="text-sm text-indigo-700">
          This notification will be sent to: <span className="font-medium">{getTierNames()}</span>
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg mb-4 border border-gray-200 shadow-sm">
        <div className="flex items-center mb-3">
          {user.profileImage ? (
            <img 
              src={user.profileImage} 
              alt={user.name} 
              className="h-10 w-10 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center">
              <User className="h-5 w-5 text-indigo-600" />
            </div>
          )}

          <div className="ml-3">
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500 flex items-center">
              <Building2 className="h-3 w-3 mr-1 flex-shrink-0" aria-hidden="true" />
              {user.jobTitle}{user.company ? ` at ${user.company}` : ''}
            </p>
          </div>
        </div>

        <p className="text-gray-700 mb-4 bg-indigo-50 p-2 rounded-lg text-sm">
          <span className="font-medium">{user.name.split(' ')[0]}</span> has updated their profile information:
        </p>

        <div className="space-y-3">
          {updatedFields.map((field) => {
            const FieldIcon = getFieldIcon(field);
            return (
              <motion.div 
                key={field} 
                className="flex items-center text-sm bg-white p-2 rounded-lg border border-gray-100"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-1.5 bg-indigo-100 rounded-md mr-3">
                  <FieldIcon className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="font-medium text-gray-800">{formatFieldName(field)}</span>
                <span className="ml-2 text-gray-500">was updated</span>
                <Check className="h-3 w-3 ml-auto text-green-500" />
              </motion.div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Sent via Dislink</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {selectedTiers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50 p-3 rounded-lg mb-4 text-sm text-amber-700"
          >
            <div className="flex items-start">
              <div className="mr-2 mt-0.5">⚠️</div>
              <div>No notification circles selected. Please select at least one circle to send notifications to.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="text-center">
        <p className="text-xs text-gray-500">
          You can customize notification settings anytime in your profile settings.
        </p>
      </div>
    </motion.div>
  );
}