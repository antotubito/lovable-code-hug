import React, { useState } from 'react';
+import { motion, AnimatePresence } from 'framer-motion';
+import { 
+  Bell, BellOff, User, Building2, Mail, Phone, Link as LinkIcon, 
+  Heart, MapPin, MessageCircle, Calendar, Info, Check, X,
+  UserCircle, Users, UserPlus, Settings, Toggle
+} from 'lucide-react';
+
+interface NotificationSettingsProps {
+  settings: {
+    tiers: {
+      tier1: boolean;  // Inner Circle
+      tier2: boolean;  // Middle Circle
+      tier3: boolean;  // Outer Circle
+    };
+    types: {
+      profileUpdates: boolean;
+      dailyNeeds: boolean;
+      socialUpdates: boolean;
+      locationUpdates: boolean;
+      bioUpdates: boolean;
+      interestsUpdates: boolean;
+      followUpReminders: boolean;
+    };
+  };
+  onChange: (settings: any) => void;
+  onSave: () => Promise<void>;
+  saving?: boolean;
+  saveSuccess?: boolean;
+}
+
+export function NotificationSettings({ 
+  settings, 
+  onChange, 
+  onSave,
+  saving = false,
+  saveSuccess = false
+}: NotificationSettingsProps) {
+  const [showInfo, setShowInfo] = useState(false);
+
+  const tiers = [
+    {
+      id: 'tier1',
+      name: 'Inner Circle',
+      description: 'Close connections, frequent contact',
+      icon: UserCircle,
+      color: 'text-red-600 bg-red-100 border-red-200',
+      activeColor: 'text-white bg-gradient-to-r from-red-600 to-red-500 border-red-700',
+      hoverColor: 'hover:bg-red-50'
+    },
+    {
+      id: 'tier2',
+      name: 'Middle Circle',
+      description: 'Regular connections, occasional contact',
+      icon: Users,
+      color: 'text-amber-600 bg-amber-100 border-amber-200',
+      activeColor: 'text-white bg-gradient-to-r from-amber-600 to-amber-500 border-amber-700',
+      hoverColor: 'hover:bg-amber-50'
+    },
+    {
+      id: 'tier3',
+      name: 'Outer Circle',
+      description: 'Acquaintances, infrequent contact',
+      icon: UserPlus,
+      color: 'text-blue-600 bg-blue-100 border-blue-200',
+      activeColor: 'text-white bg-gradient-to-r from-blue-600 to-blue-500 border-blue-700',
+      hoverColor: 'hover:bg-blue-50'
+    }
+  ];
+
+  const notificationTypes = [
+    {
+      id: 'profileUpdates',
+      title: 'Profile Updates',
+      description: 'When connections update their profile information',
+      icon: User
+    },
+    {
+      id: 'dailyNeeds',
+      title: 'Daily Needs',
+      description: 'When connections post new daily needs',
+      icon: Heart
+    },
+    {
+      id: 'socialUpdates',
+      title: 'Social Platform Updates',
+      description: 'When connections add or change social links',
+      icon: LinkIcon
+    },
+    {
+      id: 'locationUpdates',
+      title: 'Location Updates',
+      description: 'When connections update their location',
+      icon: MapPin
+    },
+    {
+      id: 'bioUpdates',
+      title: 'Bio Updates',
+      description: 'When connections update their bio information',
+      icon: MessageCircle
+    },
+    {
+      id: 'interestsUpdates',
+      title: 'Interests Updates',
+      description: 'When connections update their interests',
+      icon: Heart
+    },
+    {
+      id: 'followUpReminders',
+      title: 'Follow-up Reminders',
+      description: 'Reminders to follow up with your connections',
+      icon: Calendar
+    }
+  ];
+
+  const toggleTier = (tierId: string) => {
+    onChange({
+      ...settings,
+      tiers: {
+        ...settings.tiers,
+        [tierId]: !settings.tiers[tierId]
+      }
+    });
+  };
+
+  const toggleNotificationType = (typeId: string) => {
+    onChange({
+      ...settings,
+      types: {
+        ...settings.types,
+        [typeId]: !settings.types[typeId]
+      }
+    });
+  };
+
+  const toggleAllTiers = () => {
+    const allEnabled = Object.values(settings.tiers).every(v => v);
+    const newValue = !allEnabled;
+    
+    onChange({
+      ...settings,
+      tiers: {
+        tier1: newValue,
+        tier2: newValue,
+        tier3: newValue
+      }
+    });
+  };
+
+  const toggleAllTypes = () => {
+    const allEnabled = Object.values(settings.types).every(v => v);
+    const newValue = !allEnabled;
+    
+    const newTypes = Object.keys(settings.types).reduce((acc, key) => {
+      acc[key] = newValue;
+      return acc;
+    }, {});
+    
+    onChange({
+      ...settings,
+      types: newTypes
+    });
+  };
+
+  return (
+    <div className="space-y-8">
+      {/* Notification Tiers */}
+      <div>
+        <div className="flex justify-between items-center mb-4">
+          <div className="flex items-center">
+            <h3 className="text-lg font-medium text-gray-900">Notification Circles</h3>
+            <button
+              type="button"
+              onClick={() => setShowInfo(!showInfo)}
+              className="ml-2 text-gray-400 hover:text-gray-500 p-1 hover:bg-gray-100 rounded-full"
+            >
+              <Info className="h-4 w-4" />
+            </button>
+          </div>
+          <button
+            onClick={toggleAllTiers}
+            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
+          >
+            {Object.values(settings.tiers).every(v => v) ? 'Deselect All' : 'Select All'}
+          </button>
+        </div>
+        
+        <AnimatePresence>
+          {showInfo && (
+            <motion.div
+              initial={{ opacity: 0, height: 0 }}
+              animate={{ opacity: 1, height: 'auto' }}
+              exit={{ opacity: 0, height: 0 }}
+              className="bg-indigo-50 p-4 rounded-lg mb-4 text-sm text-indigo-700"
+            >
+              When you update your profile information, notifications will be sent to the selected relationship circles.
+              This helps keep your connections informed about your latest changes.
+            </motion.div>
+          )}
+        </AnimatePresence>
+        
+        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
+          {tiers.map((tier) => {
+            const isSelected = settings.tiers[tier.id];
+            const Icon = tier.icon;
+            
+            return (
+              <motion.button
+                key={tier.id}
+                whileHover={{ scale: 1.02 }}
+                whileTap={{ scale: 0.98 }}
+                onClick={() => toggleTier(tier.id)}
+                className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 ${
+                  isSelected 
+                    ? tier.activeColor + ' shadow-md'
+                    : `${tier.color} ${tier.hoverColor}`
+                } cursor-pointer`}
+              >
+                <div className="flex-shrink-0 mr-3">
+                  <Icon className="h-5 w-5" />
+                </div>
+                <div className="flex-1 text-left">
+                  {isSelected && (
+                    <span className="absolute top-2 right-2 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">Active</span>
+                  )}
+                  <p className={`font-medium text-sm ${isSelected ? 'text-white' : ''}`}>{tier.name}</p>
+                </div>
+                <div className="flex-shrink-0 ml-2">
+                  {isSelected ? (
+                    <Bell className="h-4 w-4" />
+                  ) : (
+                    <BellOff className="h-4 w-4" />
+                  )}
+                </div>
+              </motion.button>
+            );
+          })}
         </div>
       </div>
 
-      <p className="text-xs text-gray-500">
-        This is a preview of the notification that will be sent to your connections in the selected circles.
-      </p>
+      {/* Notification Types */}
+      <div>
+        <div className="flex justify-between items-center mb-4">
+          <h3 className="text-lg font-medium text-gray-900">Notification Types</h3>
+          <button
+            onClick={toggleAllTypes}
+            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
+          >
+            {Object.values(settings.types).every(v => v) ? 'Disable All' : 'Enable All'}
+          </button>
+        </div>
+        
+        <div className="space-y-3 bg-white rounded-lg border border-gray-200 p-4">
+          {notificationTypes.map((notification) => {
+            const Icon = notification.icon;
+            const isEnabled = settings.types[notification.id];
+            
+            return (
+              <div key={notification.id} className="flex items-center justify-between">
+                <div className="flex items-center">
+                  <div className={`p-2 rounded-lg mr-3 ${isEnabled ? 'bg-indigo-100' : 'bg-gray-100'}`}>
+                    <Icon className={`h-4 w-4 ${isEnabled ? 'text-indigo-600' : 'text-gray-400'}`} />
+                  </div>
+                  <div>
+                    <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
+                    <p className="text-xs text-gray-500">{notification.description}</p>
+                  </div>
+                </div>
+                <button
+                  onClick={() => toggleNotificationType(notification.id)}
+                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
+                    isEnabled ? 'bg-indigo-600' : 'bg-gray-200'
+                  }`}
+                >
+                  <span
+                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
+                      isEnabled ? 'translate-x-5' : 'translate-x-0'
+                    }`}
+                  />
+                </button>
+              </div>
+            );
+          })}
+        </div>
+      </div>
+      
+      {/* Save Button */}
+      <div className="flex justify-end pt-4">
+        <button
+          onClick={onSave}
+          disabled={saving}
+          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
+        >
+          {saving ? (
+            <>
+              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
+                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
+                <path
+                  className="opacity-75"
+                  fill="currentColor"
+                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
+                />
+              </svg>
+              Saving...
+            </>
+          ) : saveSuccess ? (
+            <>
+              <Check className="h-4 w-4 mr-1.5" />
+              Saved!
+            </>
+          ) : (
+            'Save Settings'
+          )}
+        </button>
+      </div>
     </div>
   );
 }