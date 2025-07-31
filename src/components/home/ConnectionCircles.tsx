import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Circle, Users, Info, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Contact } from '../../types/contact';

interface ConnectionCirclesProps {
  contacts: Contact[];
}

export function ConnectionCircles({ contacts }: ConnectionCirclesProps) {
  const navigate = useNavigate();
  const [innerCircle, setInnerCircle] = useState<Contact[]>([]);
  const [middleCircle, setMiddleCircle] = useState<Contact[]>([]);
  const [outerCircle, setOuterCircle] = useState<Contact[]>([]);
  const [uncategorized, setUncategorized] = useState<Contact[]>([]);
  const [hoveredCircle, setHoveredCircle] = useState<number | null>(null);

  useEffect(() => {
    // Categorize contacts by tier
    const tier1 = contacts.filter(contact => contact.tier === 1);
    const tier2 = contacts.filter(contact => contact.tier === 2);
    const tier3 = contacts.filter(contact => contact.tier === 3);
    const noTier = contacts.filter(contact => !contact.tier);

    setInnerCircle(tier1);
    setMiddleCircle(tier2);
    setOuterCircle(tier3);
    setUncategorized(noTier);
  }, [contacts]);

  const totalContacts = contacts.length;
  const innerPercentage = Math.round((innerCircle.length / totalContacts) * 100) || 0;
  const middlePercentage = Math.round((middleCircle.length / totalContacts) * 100) || 0;
  const outerPercentage = Math.round((outerCircle.length / totalContacts) * 100) || 0;
  const uncategorizedPercentage = Math.round((uncategorized.length / totalContacts) * 100) || 0;

  const handleNavigateToContacts = () => {
    navigate('/app/contacts');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Circle className="h-5 w-5 mr-2 text-indigo-500" />
          Your Connection Circles
        </h2>
        <button
          onClick={handleNavigateToContacts}
          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
        >
          View All
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Circles Visualization */}
        <div className="relative w-full md:w-1/2 h-64 flex items-center justify-center">
          {/* Outer Circle */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            onMouseEnter={() => setHoveredCircle(3)}
            onMouseLeave={() => setHoveredCircle(null)}
            className={`absolute w-56 h-56 rounded-full border-4 ${
              hoveredCircle === 3 ? 'border-blue-500' : 'border-blue-300'
            } flex items-center justify-center transition-colors duration-200`}
          >
            {outerCircle.length > 0 && (
              <div className="absolute -right-2 -top-2 bg-blue-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                {outerCircle.length}
              </div>
            )}
          </motion.div>

          {/* Middle Circle */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onMouseEnter={() => setHoveredCircle(2)}
            onMouseLeave={() => setHoveredCircle(null)}
            className={`absolute w-40 h-40 rounded-full border-4 ${
              hoveredCircle === 2 ? 'border-amber-500' : 'border-amber-300'
            } flex items-center justify-center transition-colors duration-200`}
          >
            {middleCircle.length > 0 && (
              <div className="absolute -right-2 -top-2 bg-amber-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                {middleCircle.length}
              </div>
            )}
          </motion.div>

          {/* Inner Circle */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onMouseEnter={() => setHoveredCircle(1)}
            onMouseLeave={() => setHoveredCircle(null)}
            className={`absolute w-24 h-24 rounded-full border-4 ${
              hoveredCircle === 1 ? 'border-red-500' : 'border-red-300'
            } flex items-center justify-center transition-colors duration-200`}
          >
            {innerCircle.length > 0 && (
              <div className="absolute -right-2 -top-2 bg-red-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                {innerCircle.length}
              </div>
            )}
          </motion.div>

          {/* Center */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center"
          >
            <Users className="h-6 w-6 text-white" />
          </motion.div>
        </div>

        {/* Stats */}
        <div className="w-full md:w-1/2 space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-sm font-medium">Inner Circle</span>
              </div>
              <span className="text-sm font-medium">{innerCircle.length} contacts ({innerPercentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${innerPercentage}%` }}
                transition={{ duration: 1 }}
                className="bg-red-500 h-2 rounded-full"
              ></motion.div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                <span className="text-sm font-medium">Middle Circle</span>
              </div>
              <span className="text-sm font-medium">{middleCircle.length} contacts ({middlePercentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${middlePercentage}%` }}
                transition={{ duration: 1 }}
                className="bg-amber-500 h-2 rounded-full"
              ></motion.div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm font-medium">Outer Circle</span>
              </div>
              <span className="text-sm font-medium">{outerCircle.length} contacts ({outerPercentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${outerPercentage}%` }}
                transition={{ duration: 1 }}
                className="bg-blue-500 h-2 rounded-full"
              ></motion.div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                <span className="text-sm font-medium">Uncategorized</span>
              </div>
              <span className="text-sm font-medium">{uncategorized.length} contacts ({uncategorizedPercentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${uncategorizedPercentage}%` }}
                transition={{ duration: 1 }}
                className="bg-gray-400 h-2 rounded-full"
              ></motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-indigo-50 p-4 rounded-lg flex items-start">
        <Info className="h-5 w-5 text-indigo-500 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <p className="text-sm text-indigo-700">
            Organize your contacts into circles to prioritize your relationships. 
            Inner circle contacts are your closest connections, middle circle are regular contacts, 
            and outer circle are acquaintances.
          </p>
          {uncategorized.length > 0 && (
            <p className="text-sm text-indigo-700 mt-2 font-medium">
              You have {uncategorized.length} uncategorized contacts. Categorize them to better manage your network.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}