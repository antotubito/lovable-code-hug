import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConnectionStatsProps {
  totalConnections: number;
  pendingRequests: number;
}

export function ConnectionStats({ totalConnections, pendingRequests }: ConnectionStatsProps) {
  const navigate = useNavigate();

  const handleViewPendingRequests = () => {
    // Navigate to home page and scroll to connection requests section
    navigate('/app');
    
    // Add a small delay to ensure the page loads before scrolling
    setTimeout(() => {
      const requestsSection = document.getElementById('connection-requests');
      if (requestsSection) {
        requestsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      {/* Total Connections */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Connections</p>
              <p className="text-2xl font-bold text-gray-900">{totalConnections}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/app/contacts')}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </motion.div>

      {/* Pending Requests */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{pendingRequests}</p>
            </div>
          </div>
          {pendingRequests > 0 && (
            <button
              onClick={handleViewPendingRequests}
              className="flex items-center text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              Review
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}