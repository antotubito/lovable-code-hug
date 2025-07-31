import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Zap } from 'lucide-react';

// Function to generate a realistic but fake connection count
// that increases over time to simulate real-world usage
function getWorldwideConnections() {
  // Base number of connections (start from January 1, 2024)
  const startDate = new Date('2024-01-01').getTime();
  const now = new Date().getTime();
  const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  
  // Generate a number that grows over time
  // Start with 1000 base connections
  // Add ~500 connections per day with some randomness
  const baseConnections = 1000;
  const dailyGrowth = 500;
  const randomFactor = Math.random() * 100;
  
  const totalConnections = baseConnections + (daysSinceStart * dailyGrowth) + randomFactor;
  
  return Math.floor(totalConnections);
}

export function WorldwideStats() {
  const [connections, setConnections] = React.useState(getWorldwideConnections());

  // Update the count every minute to simulate real-time growth
  React.useEffect(() => {
    const interval = setInterval(() => {
      setConnections(getWorldwideConnections());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Format number with commas
  const formattedConnections = connections.toLocaleString('en-US');
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 rounded-xl shadow-md text-white mb-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-medium text-white/80 uppercase tracking-wide">Global Network</h3>
            <p className="text-xl font-bold">{formattedConnections}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm shadow-inner">
            <Zap className="h-3 w-3 text-yellow-300 mr-1" />
            <span className="text-xs font-medium">Growing</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}