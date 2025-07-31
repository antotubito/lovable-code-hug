import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../components/auth/AuthProvider';
import { 
  User, 
  Bell, 
  Lock, 
  Shield, 
  Key, 
  Smartphone, 
  Mail, 
  Users, 
  UserCircle, 
  UserPlus, 
  BellOff, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  Building2, 
  Calendar, 
  MapPin, 
  Heart, 
  Briefcase, 
  Link as LinkIcon, 
  MessageCircle, 
  Info, 
  Settings as SettingsIcon, 
  ToggleLeft as Toggle 
} from 'lucide-react';
import { getAccessRequests, approveAccessRequest, declineAccessRequest } from '../lib/auth';
import type { TestUser } from '../types/user';

type SettingsSection = 'account' | 'email' | 'privacy';

export function Settings() {
  const { user, isOwner, refreshUser } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<TestUser[]>(
    isOwner ? getAccessRequests().filter(request => !request.approved) : []
  );
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [expandedSettings, setExpandedSettings] = useState<string[]>([]);
  const [notificationTiers, setNotificationTiers] = useState<number[]>([1]); // Default to Inner Circle
  const [notificationTypes, setNotificationTypes] = useState({
    dailyNeeds: true,
    socialUpdates: true,
    locationUpdates: true,
    bioUpdates: true,
    interestsUpdates: true
  });
  const [notificationSettings, setNotificationSettings] = useState({
    tiers: {
      tier1: true,  // Inner Circle
      tier2: true,  // Middle Circle
      tier3: false  // Outer Circle
    },
    types: {
      profileUpdates: true,
      dailyNeeds: true,
      socialUpdates: true,
      locationUpdates: true,
      bioUpdates: true,
      interestsUpdates: true,
      followUpReminders: true
    }
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleApprove = (id: string) => {
    if (!isOwner) return;
    
    if (approveAccessRequest(id)) {
      setPendingRequests(prev => prev.map(request => 
        request.id === id ? { ...request, approved: true } : request
      ));
    }
  };

  const handleDecline = (id: string) => {
    if (!isOwner) return;
    
    if (declineAccessRequest(id)) {
      setPendingRequests(prev => prev.filter(request => request.id !== id));
    }
  };

  const toggleSetting = (settingId: string) => {
    setExpandedSettings(prev => 
      prev.includes(settingId)
        ? prev.filter(id => id !== settingId)
        : [...prev, settingId]
    );
  };

  const handleSaveNotificationSettings = async () => {
    try {
      setSaving(true);
      
      // In a real implementation, this would save to the database
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // In a real implementation, we would refresh the user data
      // await refreshUser();
    } catch (error) {
      console.error('Error saving notification settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleTierNotification = (tier: 'tier1' | 'tier2' | 'tier3') => {
    setNotificationSettings(prev => ({
      ...prev,
      tiers: {
        ...prev.tiers,
        [tier]: !prev.tiers[tier]
      }
    }));
  };

  const toggleNotificationType = (type: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type]
      }
    }));
  };

  const renderAccountSettings = () => (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm">
        <button
          onClick={() => toggleSetting('profile')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-400 mr-3" />
            <div className="text-left">
              <h3 className="text-sm font-medium text-gray-900">Profile Information</h3>
              <p className="text-sm text-gray-500">Update your personal information</p>
            </div>
          </div>
          {expandedSettings.includes('profile') ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSettings.includes('profile') && (
          <div className="p-4 border-t border-gray-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={user?.name || ''}
                onChange={() => {}}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Title</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={user?.jobTitle || ''}
                onChange={() => {}}
                placeholder="Your job title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={user?.company || ''}
                onChange={() => {}}
                placeholder="Your company"
              />
            </div>
            <button
              type="button"
              className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow-sm">
        <button
          onClick={() => toggleSetting('security')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="flex items-center">
            <Key className="h-5 w-5 text-gray-400 mr-3" />
            <div className="text-left">
              <h3 className="text-sm font-medium text-gray-900">Security</h3>
              <p className="text-sm text-gray-500">Manage your security settings</p>
            </div>
          </div>
          {expandedSettings.includes('security') ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSettings.includes('security') && (
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Two-factor authentication</h4>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Enable
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Change password</h4>
                  <p className="text-sm text-gray-500">Update your password</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Connected Devices */}
      <div className="bg-white rounded-lg shadow-sm">
        <button
          onClick={() => toggleSetting('devices')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="flex items-center">
            <Smartphone className="h-5 w-5 text-gray-400 mr-3" />
            <div className="text-left">
              <h3 className="text-sm font-medium text-gray-900">Connected Devices</h3>
              <p className="text-sm text-gray-500">Manage your connected devices</p>
            </div>
          </div>
          {expandedSettings.includes('devices') ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSettings.includes('devices') && (
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Current Device</p>
                    <p className="text-xs text-gray-500">Last active: Just now</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      {/* Notification Tiers */}
      <div className="bg-white rounded-lg shadow-sm">
        <button
          onClick={() => toggleSetting('notification-tiers')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-400 mr-3" />
            <div className="text-left">
              <h3 className="text-sm font-medium text-gray-900">Notification Circles</h3>
              <p className="text-sm text-gray-500">Choose which relationship circles receive notifications</p>
            </div>
          </div>
          {expandedSettings.includes('notification-tiers') ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSettings.includes('notification-tiers') && (
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Circles</h4>
                <p className="text-sm text-gray-500 mb-3">
                  Choose which relationship circles receive notifications about your profile updates
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 1, name: 'Inner Circle', color: 'bg-red-100 text-red-600 border-red-200' },
                    { id: 2, name: 'Middle Circle', color: 'bg-amber-100 text-amber-600 border-amber-200' },
                    { id: 3, name: 'Outer Circle', color: 'bg-blue-100 text-blue-600 border-blue-200' }
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => {
                        setNotificationTiers(prev => 
                          prev.includes(tier.id)
                            ? prev.filter(id => id !== tier.id)
                            : [...prev, tier.id]
                        );
                      }}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        notificationTiers.includes(tier.id) 
                          ? tier.color
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      <span>{tier.name}</span>
                      {notificationTiers.includes(tier.id) ? (
                        <Bell className="h-4 w-4" />
                      ) : (
                        <BellOff className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Types</h4>
                <p className="text-sm text-gray-500 mb-3">
                  Choose which types of updates you want to be notified about
                </p>
                <div className="space-y-3">
                  {[
                    { id: 'dailyNeeds', label: 'Daily Needs', description: 'When someone posts a new daily need' },
                    { id: 'socialUpdates', label: 'Social Media Updates', description: 'When connections update their social links' },
                    { id: 'locationUpdates', label: 'Location Updates', description: 'When connections update their location' },
                    { id: 'bioUpdates', label: 'Bio Updates', description: 'When connections update their bio' },
                    { id: 'interestsUpdates', label: 'Interests Updates', description: 'When connections update their interests' }
                  ].map((type) => (
                    <div key={type.id} className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">{type.label}</h5>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={notificationTypes[type.id as keyof typeof notificationTypes]}
                          onChange={() => {
                            setNotificationTypes(prev => ({
                              ...prev,
                              [type.id]: !prev[type.id as keyof typeof notificationTypes]
                            }));
                          }}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Info className="h-4 w-4 text-indigo-600 mr-2" />
                  <p className="text-sm text-indigo-700 font-medium">About Notification Circles</p>
                </div>
                <p className="text-sm text-indigo-600">
                  Choose which relationship circles receive notifications when you update your profile information. 
                  This helps keep your network informed about your latest changes.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Inner Circle */}
                <div 
                  className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                    notificationSettings.tiers.tier1 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleTierNotification('tier1')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <UserCircle className="h-5 w-5 text-red-600 mr-2" />
                      <h4 className="font-medium text-gray-900">Inner Circle</h4>
                    </div>
                    {notificationSettings.tiers.tier1 ? (
                      <Bell className="h-4 w-4 text-red-600" />
                    ) : (
                      <BellOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Close connections, frequent contact</p>
                </div>
                
                {/* Middle Circle */}
                <div 
                  className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                    notificationSettings.tiers.tier2 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleTierNotification('tier2')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-amber-600 mr-2" />
                      <h4 className="font-medium text-gray-900">Middle Circle</h4>
                    </div>
                    {notificationSettings.tiers.tier2 ? (
                      <Bell className="h-4 w-4 text-amber-600" />
                    ) : (
                      <BellOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Regular connections, occasional contact</p>
                </div>
                
                {/* Outer Circle */}
                <div 
                  className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                    notificationSettings.tiers.tier3 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleTierNotification('tier3')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <UserPlus className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-medium text-gray-900">Outer Circle</h4>
                    </div>
                    {notificationSettings.tiers.tier3 ? (
                      <Bell className="h-4 w-4 text-blue-600" />
                    ) : (
                      <BellOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Acquaintances, infrequent contact</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    const allEnabled = Object.values(notificationSettings.tiers).every(v => v);
                    const newValue = !allEnabled;
                    setNotificationSettings(prev => ({
                      ...prev,
                      tiers: {
                        tier1: newValue,
                        tier2: newValue,
                        tier3: newValue
                      }
                    }));
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {Object.values(notificationSettings.tiers).every(v => v) ? 'Disable All' : 'Enable All'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification Types */}
      <div className="bg-white rounded-lg shadow-sm">
        <button
          onClick={() => toggleSetting('notification-types')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-gray-400 mr-3" />
            <div className="text-left">
              <h3 className="text-sm font-medium text-gray-900">Notification Types</h3>
              <p className="text-sm text-gray-500">Choose what updates you receive</p>
            </div>
          </div>
          {expandedSettings.includes('notification-types') ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSettings.includes('notification-types') && (
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-4">
              {[
                {
                  id: 'profileUpdates',
                  title: 'Profile Updates',
                  description: 'When connections update their profile information',
                  icon: User
                },
                {
                  id: 'dailyNeeds',
                  title: 'Daily Needs',
                  description: 'When connections post new daily needs',
                  icon: Heart
                },
                {
                  id: 'socialUpdates',
                  title: 'Social Platform Updates',
                  description: 'When connections add or change social links',
                  icon: LinkIcon
                },
                {
                  id: 'locationUpdates',
                  title: 'Location Updates',
                  description: 'When connections update their location',
                  icon: MapPin
                },
                {
                  id: 'bioUpdates',
                  title: 'Bio Updates',
                  description: 'When connections update their bio information',
                  icon: MessageCircle
                },
                {
                  id: 'interestsUpdates',
                  title: 'Interests Updates',
                  description: 'When connections update their interests',
                  icon: Heart
                },
                {
                  id: 'followUpReminders',
                  title: 'Follow-up Reminders',
                  description: 'Reminders to follow up with your connections',
                  icon: Calendar
                }
              ].map((notification) => {
                const Icon = notification.icon;
                const isEnabled = notificationSettings.types[notification.id];
                
                return (
                  <div key={notification.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${isEnabled ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                        <Icon className={`h-4 w-4 ${isEnabled ? 'text-indigo-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-xs text-gray-500">{notification.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleNotificationType(notification.id)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
              
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    const allEnabled = Object.values(notificationSettings.types).every(v => v);
                    const newValue = !allEnabled;
                    const newTypes = Object.keys(notificationSettings.types).reduce((acc, key) => {
                      acc[key] = newValue;
                      return acc;
                    }, {});
                    
                    setNotificationSettings(prev => ({
                      ...prev,
                      types: newTypes
                    }));
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {Object.values(notificationSettings.types).every(v => v) ? 'Disable All' : 'Enable All'}
                </button>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveNotificationSettings}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check className="h-4 w-4 mr-1.5" />
                      Saved!
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Email Preferences */}
      <div className="bg-white rounded-lg shadow-sm">
        <button
          onClick={() => toggleSetting('email-preferences')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-gray-400 mr-3" />
            <div className="text-left">
              <h3 className="text-sm font-medium text-gray-900">Email Preferences</h3>
              <p className="text-sm text-gray-500">Manage your email settings</p>
            </div>
          </div>
          {expandedSettings.includes('email-preferences') ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSettings.includes('email-preferences') && (
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Format</label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  defaultValue="html"
                >
                  <option value="html">HTML</option>
                  <option value="text">Plain Text</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Frequency</label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  defaultValue="realtime"
                >
                  <option value="realtime">Real-time</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Digest</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      {/* Privacy & Security Controls */}
      <div className="bg-white rounded-lg shadow-sm">
        <button
          onClick={() => toggleSetting('privacy-controls')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="flex items-center">
            <Lock className="h-5 w-5 text-gray-400 mr-3" />
            <div className="text-left">
              <h3 className="text-sm font-medium text-gray-900">Privacy & Security Controls</h3>
              <p className="text-sm text-gray-500">Manage your privacy settings</p>
            </div>
          </div>
          {expandedSettings.includes('privacy-controls') ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSettings.includes('privacy-controls') && (
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-6">
              {[
                {
                  title: 'Profile visibility',
                  description: 'Control who can see your profile'
                },
                {
                  title: 'Connection requests',
                  description: 'Choose who can send you connection requests'
                },
                {
                  title: 'Activity visibility',
                  description: 'Manage who can see your activities'
                }
              ].map((setting, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 flex items-center">{setting.title}</h4>
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  </div>
                  <select
                    className="ml-3 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    defaultValue="everyone"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="connections">Connections only</option>
                    <option value="nobody">Nobody</option>
                  </select>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Security Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Two-factor authentication</h5>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <button
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Enable
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Password strength</h5>
                    <p className="text-sm text-gray-500">Your password is strong</p>
                  </div>
                  <div className="w-24 h-2 bg-green-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-5/6"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Change password</h5>
                    <p className="text-sm text-gray-500">Update your password</p>
                  </div>
                  <button
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data & Privacy */}
      <div className="bg-white rounded-lg shadow-sm">
        <button
          onClick={() => toggleSetting('data-privacy')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-gray-400 mr-3" />
            <div className="text-left">
              <h3 className="text-sm font-medium text-gray-900">Data & Privacy</h3>
              <p className="text-sm text-gray-500">Manage your data and privacy choices</p>
            </div>
          </div>
          {expandedSettings.includes('data-privacy') ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSettings.includes('data-privacy') && (
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Download your data</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Get a copy of your data, including your profile information and connections.
                </p>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Request data export
                </button>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Delete account</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Permanently delete your account and all associated data.
                </p>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>
      
      {/* Access Requests Section - Only visible to owner */}
      {isOwner && (
        <div className="bg-white shadow rounded-lg divide-y divide-gray-200 mb-8">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Access Requests</h2>
            
            {pendingRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending access requests</p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map(request => (
                  <div 
                    key={request.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      request.approved ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{request.name}</h3>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {request.email}
                          </div>
                          {request.company && (
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <Building2 className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              {request.company}
                            </div>
                          )}
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            Requested: {new Date(request.requestDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex items-center space-x-3">
                      {request.approved ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <Check className="h-4 w-4 mr-1" />
                          Approved
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleDecline(request.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent rounded-full text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Navigation */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <motion.button
              whileHover={{ backgroundColor: activeSection !== 'account' ? '#F3F4F6' : undefined }}
              onClick={() => setActiveSection('account')}
              className={`flex-1 whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium ${
                activeSection === 'account'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="h-4 w-4 inline-block mr-2" />
              Account
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: activeSection !== 'email' ? '#F3F4F6' : undefined }}
              onClick={() => setActiveSection('email')}
              className={`flex-1 whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium ${
                activeSection === 'email'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell className="h-4 w-4 inline-block mr-2" />
              Email
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: activeSection !== 'privacy' ? '#F3F4F6' : undefined }}
              onClick={() => setActiveSection('privacy')}
              className={`flex-1 whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium ${
                activeSection === 'privacy'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Lock className="h-4 w-4 inline-block mr-2" />
              Privacy
            </motion.button>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="p-6">
          {activeSection === 'account' && renderAccountSettings()}
          {activeSection === 'email' && renderEmailSettings()}
          {activeSection === 'privacy' && renderPrivacySettings()}
        </div>
      </div>
    
      {/* Success Toast */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center"
          >
            <Check className="h-5 w-5 mr-2" />
            Settings saved successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}