import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, Mail, Link as LinkIcon, Check, 
  Sparkles, Users, Shield, Zap, QrCode, Share2, 
  MapPin, Bell, Clock, BookOpen, Globe, MessageCircle,
  Smartphone, Star, X, Smile, Compass, 
  ArrowUpRight, Quote, Linkedin, Twitter, Lock, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Footer } from '../components/Footer';
import { WaitlistForm } from '../components/waitlist/WaitlistForm';

export function Waitlist() {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showTesterModal, setShowTesterModal] = useState(false);
  const [testerEmail, setTesterEmail] = useState('');
  const [testerPasscode, setTesterPasscode] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to scroll to waitlist form
  const scrollToWaitlistForm = () => {
    const waitlistSection = document.getElementById('waitlist-form');
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
      
      // Add a subtle highlight effect
      waitlistSection.classList.add('highlight-form');
      setTimeout(() => {
        waitlistSection.classList.remove('highlight-form');
      }, 2000);
    }
  };
  const handleSignIn = () => {
    navigate('/app/login');
  };

  const handleRegister = () => {
    navigate('/app/register');
  };

  const handleTesterAccess = () => {
    setShowTesterModal(true);
  };

  const handleTesterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would validate the tester credentials
    console.log('Tester login attempt:', { email: testerEmail, passcode: testerPasscode });
    navigate('/app/login');
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Track the email submission
      console.log('Waitlist submission:', { 
        email, 
        timestamp: new Date().toISOString(),
        source: 'hero-form'
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

  const features = [
    {
      icon: Compass,
      title: 'Context-Rich Connections',
      description: 'Remember where, when, and how you met each person in your network'
    },
    {
      icon: Zap,
      title: 'Smart Follow-ups',
      description: 'Never miss an opportunity to nurture important relationships'
    },
    {
      icon: Smile,
      title: 'Personal Touch',
      description: 'Keep track of preferences, interests, and shared experiences'
    },
    {
      icon: Shield,
      title: 'Private & Secure',
      description: 'Your relationships and data are protected and private'
    }
  ];

  const testimonials = [
    {
      quote: "Dislink has completely transformed how I manage my professional network. I never forget important details about connections anymore.",
      author: "A.M., Marketing Professional",
      company: "Tech Innovations Inc."
    },
    {
      quote: "The ability to categorize contacts into relationship circles has been a game-changer for prioritizing my networking efforts.",
      author: "J.D., Startup Founder",
      company: "Growth Ventures"
    },
    {
      quote: "I used to lose track of people I met at conferences. Now with Dislink, I can easily remember where and when we connected.",
      author: "S.K., Business Developer",
      company: "Global Solutions"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                <LinkIcon className="h-6 w-6 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Dislink
              </span>
            </motion.div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/story')}
                className="text-gray-600 hover:text-gray-900 font-medium text-sm"
              >
                Our Story
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignIn}
                className="text-gray-600 hover:text-gray-900 font-medium text-sm"
              >
                Sign In
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToWaitlistForm}
                className="px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              >
                Register
              </motion.button>
            </div>
          </div>
        </motion.nav>
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            id="waitlist-form"
            className="text-center relative z-10"
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
              {/* Modern geometric background */}
              <div className="absolute inset-0">
                {/* Primary gradient orbs */}
                <motion.div
                  className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-400/30 via-purple-400/20 to-transparent rounded-full"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <motion.div
                  className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-bl from-purple-400/25 via-indigo-400/15 to-transparent rounded-full"
                  animate={{
                    scale: [1.1, 1, 1.1],
                    rotate: [360, 180, 0],
                  }}
                  transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                {/* Floating geometric shapes */}
                <motion.div
                  className="absolute top-1/6 right-1/3 w-4 h-4 bg-indigo-500/40 rounded-full"
                  animate={{
                    y: [0, -20, 0],
                    x: [0, 15, 0],
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute bottom-1/3 left-1/6 w-6 h-6 bg-purple-500/30 rotate-45"
                  animate={{
                    y: [0, 15, 0],
                    x: [0, -10, 0],
                    rotate: [45, 135, 45],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                />
                <motion.div
                  className="absolute top-2/3 right-1/6 w-3 h-3 bg-indigo-400/50 rounded-full"
                  animate={{
                    x: [0, 20, 0],
                    y: [0, -15, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                />
                
                {/* Additional floating elements for more movement */}
                <motion.div
                  className="absolute top-1/4 left-1/5 w-2 h-2 bg-purple-400/30 rounded-full"
                  animate={{
                    x: [0, -25, 0],
                    y: [0, 20, 0],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 3
                  }}
                />
                <motion.div
                  className="absolute bottom-1/4 right-1/5 w-5 h-5 bg-indigo-300/25 rotate-45"
                  animate={{
                    x: [0, 12, 0],
                    y: [0, -18, 0],
                    rotate: [45, 225, 45],
                    opacity: [0.25, 0.5, 0.25],
                  }}
                  transition={{
                    duration: 14,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 4
                  }}
                />
                <motion.div
                  className="absolute top-1/2 left-1/8 w-3 h-3 bg-purple-300/35 rounded-full"
                  animate={{
                    x: [0, 18, 0],
                    y: [0, -12, 0],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 11,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 5
                  }}
                />
                
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.02]">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `
                      linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px'
                  }} />
                </div>
                
                {/* Radial gradient overlay */}
                <div className="absolute inset-0 bg-gradient-radial from-transparent via-white/5 to-white/20" />
              </div>
            </div>
            
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15,
                delay: 0.2
              }}
            >
              <div className="p-5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200">
                <LinkIcon className="h-16 w-16 text-white" />
              </div>
            </motion.div>

            <div className="relative">
              <motion.h1 
                className="text-5xl sm:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Your Network, <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Reimagined
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-600 max-w-2xl mx-auto mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Dislink helps you follow up, stay in touch, and grow your professional relationships effortlessly.
              </motion.p>
            </div>

            <motion.div 
              className="flex justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <WaitlistForm onSuccess={() => setSuccess(true)} />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-100 rounded-full opacity-50 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">How It Works</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Dislink makes networking simple, meaningful, and effective with these powerful features
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {[
              {
                icon: QrCode, 
                title: "Scan Contacts",
                description: "Save new contacts instantly using QR codes. Share your digital profile with a single scan and never lose a connection again."
              },
              {
                icon: Clock,
                title: "Smart Follow-Ups",
                description: "Get notified when it's time to reconnect. Our intelligent system reminds you to nurture important relationships at the right time."
              },
              {
                icon: MapPin,
                title: "Connection Map",
                description: "Track who you met and where. Never forget the context of your connections with location and event tracking."
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ y: -8, boxShadow: "0 15px 30px -5px rgba(79, 70, 229, 0.15), 0 10px 10px -5px rgba(79, 70, 229, 0.04)" }}
                  className="bg-white p-8 rounded-2xl shadow-lg border border-indigo-100 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Background decoration */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full opacity-50"></div>
                  
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="p-5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-6 shadow-md transform transition-transform duration-300 hover:rotate-3">
                      <Icon className="h-10 w-10 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile App Preview Section */}
      <div className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent"></div>
        
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6"
            >
              Built for Mobile, Born for Connection.
            </motion.h2>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Mobile App Mockup */}
            <div className="w-full md:w-1/2 flex justify-center relative">
              <motion.div 
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <div className="relative w-64 h-[500px] sm:w-72 sm:h-[560px] bg-gray-900 rounded-[3rem] border-[14px] border-gray-900 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-gray-900 rounded-b-xl z-10">
                    <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-1/3 h-1 bg-gray-800 rounded-full"></div>
                  </div>
                  <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[2rem] overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80" 
                      alt="Dislink Mobile App" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Floating elements */}
                <motion.div 
                  className="absolute -right-8 top-20 bg-white p-3 rounded-xl shadow-lg border border-indigo-100"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <QrCode className="h-8 w-8 text-indigo-600" />
                </motion.div>
                
                <motion.div 
                  className="absolute -left-8 top-1/3 bg-white p-3 rounded-xl shadow-lg border border-red-100"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  viewport={{ once: true }}
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, delay: 1 }}
                >
                  <MapPin className="h-8 w-8 text-red-500" />
                </motion.div>
                
                <motion.div 
                  className="absolute -right-12 bottom-1/4 bg-white p-3 rounded-xl shadow-lg border border-amber-100"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  viewport={{ once: true }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
                >
                  <Bell className="h-8 w-8 text-amber-500" />
                </motion.div>
              </motion.div>
              
              {/* Background decoration */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-indigo-300/30 to-purple-300/30 rounded-full blur-3xl -z-10"></div>
            </div>
            
            {/* Description */}
            <motion.div 
              className="w-full md:w-1/2 relative z-10"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
              viewport={{ once: true }}
            >
              <div className="bg-white p-8 rounded-xl shadow-lg border border-indigo-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
                  While we finalize the mobile version, join the waitlist and shape the future of Dislink.
                </h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Our mobile app is designed to make networking effortless. Scan QR codes to connect, track meeting locations automatically, and never forget important details about your connections.
                </p>
                <div className="space-y-5 mb-8">
                  {[
                    {
                      icon: QrCode,
                      text: "Scan QR codes to connect instantly with new contacts"
                    },
                    {
                      icon: MapPin,
                      text: "Track meeting locations automatically"
                    },
                    {
                      icon: Clock,
                      text: "Never forget important details about your connections"
                    }
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="flex items-center"
                    >
                      <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <item.icon className="h-4 w-4 text-indigo-600" />
                      </div>
                      <p className="text-gray-700 font-medium">{item.text}</p>
                    </motion.div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={scrollToWaitlistForm}
                  className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-full shadow-lg text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                >
                  Join Waitlist
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-20 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-gray-50 to-transparent"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-100 rounded-full opacity-30 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">What Our Early Testers Say</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Hear from professionals who are already transforming their networking experience
              </p>
            </motion.div>
          </div>
          
          <div className="relative mt-16">
            {/* Testimonial Cards */}
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4"
              >
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 * index, duration: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    className="flex-1"
                  >
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-indigo-100 h-full flex flex-col relative overflow-hidden">
                      {/* Background decoration */}
                      <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-100 rounded-full opacity-50"></div>
                      <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-purple-100 rounded-full opacity-50"></div>
                      
                      <div className="mb-6 text-indigo-500 relative z-10 flex justify-center">
                        <div className="p-3 bg-indigo-100 rounded-full">
                          <Quote className="h-6 w-6 text-indigo-500" />
                        </div>
                      </div>
                      <p className="text-gray-700 mb-8 flex-grow italic relative z-10 text-center">"{testimonial.quote}"</p>
                      <div className="relative z-10">
                        <div className="pt-6 border-t border-gray-100">
                          <p className="font-semibold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-center">{testimonial.author}</p>
                          <p className="text-sm text-gray-600 text-center">{testimonial.company}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {/* Waitlist Signup Section */}
      <div className="py-20 bg-white relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gray-100 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Get Early Access
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
                Be the first to experience Dislink on mobile. Join our exclusive waitlist for early access.
              </p>
            </motion.div>
            
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-green-50 p-6 rounded-xl border border-green-100 max-w-md mx-auto"
                >
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">You're in!</h3>
                  <p className="text-gray-600">
                    Thanks for joining our waitlist. We'll keep you posted on our progress and let you know when Dislink is ready for you.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-md mx-auto"
                >
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-12 pr-36 py-4 border-2 border-gray-200 rounded-full focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-400 shadow-sm"
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <motion.button
                        type="submit"
                        onClick={handleWaitlistSubmit}
                        disabled={loading || !email.trim()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ transformOrigin: 'center' }}
                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                            />
                          </div>
                        ) : (
                          'Join Waitlist'
                        )}
                      </motion.button>
                    </div>
                  </div>
                  
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex items-center text-sm text-red-600 bg-red-50 p-2 rounded-lg"
                    >
                      <div className="h-4 w-4 mr-2 text-red-500">⚠</div>
                      {error}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-12 text-center text-white shadow-xl border border-indigo-500/20 relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
            
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                  Ready to Transform Your Network? ✨
                </h2>
                <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                  Join thousands of professionals building meaningful connections that last. Never let an important relationship slip away again!
                </p>
              </motion.div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={scrollToWaitlistForm}
                  onClick={scrollToWaitlistForm}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:bg-gray-100 font-bold text-lg shadow-lg border-2 border-white"
                >
                  Join the Mobile App Waitlist
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleTesterAccess}
                  className="w-full sm:w-auto px-8 py-4 border-2 border-white rounded-full hover:bg-white/10 font-medium text-lg"
                >
                  Tester Access
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Tester Access Modal */}
      <AnimatePresence>
        {showTesterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowTesterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-indigo-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <Lock className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tester Access</h3>
                <p className="text-gray-600">
                  This area is for testers only. Your feedback helps shape the future of Dislink.
                </p>
              </div>
              
              <form onSubmit={handleTesterSubmit} className="space-y-4">
                <div>
                  <label htmlFor="testerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="testerEmail"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 hover:border-indigo-300"
                    value={testerEmail}
                    onChange={(e) => setTesterEmail(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="testerPasscode" className="block text-sm font-medium text-gray-700 mb-1">
                    Access Code
                  </label>
                  <input
                    type="password"
                    id="testerPasscode"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 hover:border-indigo-300"
                    value={testerPasscode}
                    onChange={(e) => setTesterPasscode(e.target.value)}
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md"
                  >
                    Access Testing Environment
                  </button>
                </div>
              </form>
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-medium text-amber-800 mb-2 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Tester Feedback
                  </h4>
                  <p className="text-sm text-amber-700 mb-3">
                    Your insights are invaluable! Please share your thoughts on the app experience, features, and any bugs you encounter.
                  </p>
                  <a 
                    href="https://forms.gle/example" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-white text-amber-700 rounded-lg text-sm font-medium border border-amber-200 hover:bg-amber-100 transition-all duration-200 shadow-sm"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Waitlist;