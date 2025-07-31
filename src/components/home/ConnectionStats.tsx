import { motion } from 'framer-motion';
import { Users, Clock, ArrowRight, UserPlus, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ConnectionStats({ totalConnections, pendingRequests }: ConnectionStatsProps) {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const handleViewPendingRequests = () => {
    // Navigate to home page and scroll to connection requests section
    navigate('/app');
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-wrap gap-4 mb-6"
    >
      <motion.div 
        variants={itemVariants}
        className="flex-1 min-w-[180px] bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl shadow-sm border border-indigo-200"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-md">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Connections</p>
            <p className="text-xl font-bold text-gray-900">{totalConnections}</p>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05, x: 3 }}
            onClick={() => navigate('/app/contacts')}
            className="flex items-center text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View All
            <ArrowRight className="h-3 w-3 ml-1" />
          </motion.button>
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="flex-1 min-w-[180px] bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl shadow-sm border border-amber-200"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">Pending</p>
            <p className="text-xl font-bold text-gray-900">{pendingRequests}</p>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          {pendingRequests > 0 ? (
            <motion.button
              whileHover={{ scale: 1.05, x: 3 }}
              onClick={handleViewPendingRequests}
              className="flex items-center text-xs text-amber-600 hover:text-amber-800 font-medium"
            >
              Review
              <ArrowRight className="h-3 w-3 ml-1" />
            </motion.button>
          ) : (
            <span className="text-xs text-amber-600">No requests</span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}