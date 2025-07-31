import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Loader, AlertCircle, Sparkles, Users, Clock, CheckCircle } from 'lucide-react';

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

interface WaitlistFormProps {
  onSuccess?: () => void;
}

export function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const [connections, setConnections] = useState(getWorldwideConnections());
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPulse, setShowPulse] = useState(false);
  const [recentJoins, setRecentJoins] = useState<{ name: string, role: string, location: string }[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Update the count every minute to simulate real-time growth
  React.useEffect(() => {
    const interval = setInterval(() => {
      setConnections(getWorldwideConnections());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Simulate recent joins
  useEffect(() => {
    const names = ['Sarah', 'John', 'Maria', 'Alex', 'Emma', 'David', 'Lisa', 'Mike', 'Anna', 'James'];
    const roles = ['Product Designer', 'Software Engineer', 'Marketing Lead', 'Startup Founder', 'Community Manager', 'UX Researcher', 'Business Developer', 'Product Manager', 'Content Creator', 'Data Scientist'];
    const locations = ['San Francisco', 'London', 'Berlin', 'New York', 'Toronto', 'Amsterdam', 'Singapore', 'Sydney', 'Paris', 'Tokyo'];
    
    const interval = setInterval(() => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      
      setRecentJoins(prev => [
        { name: randomName, role: randomRole, location: randomLocation },
        ...prev.slice(0, 2)
      ]);
      
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 1000);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Track the email submission with source
      console.log('Waitlist submission:', { 
        email, 
        timestamp: new Date().toISOString(),
        source: 'waitlist-form'
      });

      const formData = new FormData();
      formData.append('email', email);

      await fetch(
        "https://script.google.com/macros/s/AKfycbwKKvizfbtw_tPGVSkEm1bNfZ39EB-PHJYZlCDGQzn4gleqgf-Ag29Q-L6snPXQ_o8V/exec",
        {
          method: "POST",
          mode: 'no-cors',
          body: formData
        }
      );

      setSuccess(true);
      setEmail('');
      onSuccess?.();
      
      // Track successful submission
      console.log('Waitlist submission successful:', { 
        email, 
        timestamp: new Date().toISOString() 
      });
      
    } catch (err) {
      console.error('Submission error:', err);
      setError("Failed to join waitlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format number with commas
  const formattedConnections = connections.toLocaleString();

  // Animation variants
  const formVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="max-w-md w-full space-y-6">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            variants={formVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-white p-6 rounded-xl shadow-md border border-green-100"
          >
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">You're on the list!</h3>
              <p className="text-gray-600 mb-4">
                Thanks for joining our waitlist. We'll notify you when Dislink is ready for you.
              </p>
              <div className="flex justify-center">
                <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Email confirmation sent
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            onSubmit={handleSubmit} 
            className="relative"
            variants={formVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className={`relative transition-all duration-300 ${isInputFocused ? 'transform scale-[1.02]' : ''}`}>
              <div className={`absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full opacity-20 blur ${isInputFocused ? 'opacity-30' : ''}`}></div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  className="block w-full pl-12 pr-36 py-4 border-2 border-gray-200 rounded-full focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white shadow-sm"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <motion.button
                    type="submit"
                    disabled={loading || !email.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ transformOrigin: 'center' }}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <Loader className="animate-spin h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Join Waitlist
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 flex items-center text-sm text-red-600 bg-red-50 p-2 rounded-lg"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </motion.div>
            )}
          </motion.form>
        )}
      </AnimatePresence>

      {/* Live Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap justify-center gap-4 text-sm"
      >
        <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 flex items-center">
          <motion.div 
            className="flex items-center"
            animate={showPulse ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Users className="h-4 w-4 mr-2 text-indigo-500" />
            <span className="text-gray-700 font-medium">{formattedConnections.toLocaleString()} people waiting</span>
          </motion.div>
        </div>
        <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 flex items-center">
          <Clock className="h-4 w-4 mr-2 text-indigo-500" />
          <span className="text-gray-700 font-medium">Limited spots available</span>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <AnimatePresence>
        {recentJoins.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} 
            className="flex items-center justify-center text-sm"
          >
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-indigo-100 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
              <span className="text-indigo-700 font-medium">
                {recentJoins[0].name} from {recentJoins[0].location} just joined!
              </span>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} 
            className="flex items-center text-sm text-red-600 bg-red-50 p-2 rounded-lg"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}