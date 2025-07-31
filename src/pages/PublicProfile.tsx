import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Building2, Mail, Phone, MapPin, Globe, Heart, Lock,
  Linkedin, Twitter, Github, Instagram, Facebook, Youtube,
  MessageCircle as WhatsApp, Link as LinkIcon, Download,
  BookOpen, Users, Star, Sparkles, ArrowRight, Send as Telegram,
  MessageSquare as Discord, Twitch, AtSign as Threads,
  Coffee as BuyMeACoffee, Heart as Patreon, Rss as Substack,
  Send, Check, Briefcase, Video, Music, DollarSign, Calendar,
  Ghost, Dribbble, X, Copy, QrCode, Share2, Edit2, AlertCircle,
  Smartphone, ArrowUpRight, Clock, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateQRCode, requestConnection } from '../lib/qr';
import { SOCIAL_CATEGORIES } from '../config/social';
import { supabase } from '../lib/supabase';
import { AppStoreButtons } from '../components/AppStoreButtons';
import { shareContent, isMobileApp } from '../lib/mobileUtils';

export function PublicProfile() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [email, setEmail] = useState('');
  const [connectionCode, setConnectionCode] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [scanLocation, setScanLocation] = useState<{ latitude: number; longitude: number; name?: string } | null>(null);
  const [scanTimestamp] = useState(new Date());

  useEffect(() => {
    // Track QR code scan event
    const trackScanEvent = async () => {
      try {
        // Get user's location when they scan the QR code
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              };
              setScanLocation(location);
              
              // Log scan event with location and timestamp
              console.log('QR Code Scan Event:', {
                code,
                timestamp: scanTimestamp.toISOString(),
                location,
                userAgent: navigator.userAgent,
                referrer: document.referrer,
                url: window.location.href
              });
              
              // Reverse geocode to get location name
              fetch(`https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=demo&no_annotations=1`)
                .then(response => response.json())
                .then(data => {
                  if (data.results && data.results.length > 0) {
                    const result = data.results[0];
                    const locationName = result.formatted || 'Unknown Location';
                    setScanLocation(prev => prev ? { ...prev, name: locationName } : null);
                  }
                })
                .catch(err => console.warn('Geocoding failed:', err));
            },
            (error) => {
              console.warn('Location access denied:', error);
              // Still log the scan event without location
              console.log('QR Code Scan Event (No Location):', {
                code,
                timestamp: scanTimestamp.toISOString(),
                userAgent: navigator.userAgent,
                referrer: document.referrer,
                url: window.location.href
              });
            }
          );
        }
      } catch (err) {
        console.error('Error tracking scan event:', err);
      }
    };

    trackScanEvent();

    async function loadProfile() {
      if (!code) {
        setError('Invalid profile link');
        setLoading(false);
        return;
      }

      // Handle test profile
      if (code === 'test-profile') {
        const testProfile = {
          userId: 'test-user-id',
          name: 'Antonio Tubito',
          jobTitle: 'Founder & CEO',
          company: 'Dislink',
          profileImage: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          bio: {
            location: 'Lisbon, Portugal',
            from: 'Milan, Italy',
            about: 'Passionate entrepreneur dedicated to revolutionizing how professionals build and maintain meaningful connections. Founded Dislink to solve the problem of forgotten relationships and missed opportunities.'
          },
          interests: ['Networking', 'Technology', 'Entrepreneurship', 'Product Design', 'AI', 'Travel'],
          socialLinks: {
            linkedin: 'https://linkedin.com/in/antoniotubito',
            twitter: 'https://twitter.com/antoniotubito',
            github: 'https://github.com/antoniotubito',
            portfolio: 'https://dislink.com'
          },
          publicProfile: {
            enabled: true,
            defaultSharedLinks: {
              linkedin: true,
              twitter: true,
              github: true,
              portfolio: true
            },
            allowedFields: {
              email: false,
              phone: false,
              company: true,
              jobTitle: true,
              bio: true,
              interests: true,
              location: true
            }
          },
          isExpired: false,
          code: 'test-profile'
        };
        
        setProfile(testProfile);
        setLoading(false);
        return;
      }
      try {
        console.log("Validating code:", code);
        
        // First try to get profile directly from Supabase
        const { data: directProfile, error: directError } = await supabase
          .from('connection_codes')
          .select(`
            id,
            user_id,
            status,
            profiles!connection_codes_user_id_fkey (
              id,
              first_name,
              last_name,
              job_title,
              company,
              profile_image,
              bio,
              social_links,
              interests,
              public_profile
            )
          `)
          .eq('code', code)
          .maybeSingle(); // Changed from .single() to .maybeSingle()
        
        if (directError) {
          console.error("Supabase query error:", directError);
          throw new Error('Failed to load profile');
        }
        
        if (!directProfile) {
          setError('Profile not found');
          setLoading(false);
          return;
        }
        
        if (directProfile?.profiles) {
          // Format profile data
          const formattedProfile = {
            userId: directProfile.profiles.id,
            name: `${directProfile.profiles.first_name} ${directProfile.profiles.last_name}`.trim(),
            jobTitle: directProfile.profiles.job_title,
            company: directProfile.profiles.company,
            profileImage: directProfile.profiles.profile_image,
            bio: directProfile.profiles.bio,
            socialLinks: directProfile.profiles.social_links,
            interests: directProfile.profiles.interests,
            publicProfile: directProfile.profiles.public_profile,
            isExpired: directProfile.status !== 'active',
            code: code
          };
          
          if (formattedProfile.isExpired) {
            setIsExpired(true);
          } else {
            // Use the tracked scan location
            const location = scanLocation;
            setProfile(formattedProfile);
            setShowEmailForm(true);
          }
        } else {
          const result = await validateQRCode(code);
          
          if (result.isExpired) {
            setIsExpired(true);
            setProfile(result);
          } else {
            setProfile(result);
            setShowEmailForm(true);
          }
        }
          
        // Log successful connection request
        console.log('Connection Request Successful:', {
          code,
          email,
          connectionCode: result.connectionCode,
          timestamp: new Date().toISOString(),
          scanLocation,
          scanTimestamp: scanTimestamp.toISOString()
        });
      } catch (err) {
        console.error("Error loading profile:", err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [code]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setSubmitting(true);

    try {
      // Validate email
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Get current location
      let location;
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
      } catch (err) {
        console.warn('Location access denied:', err);
      }

      // Request connection
      const result = await requestConnection(code!, email, location);
      
      if (result.success) {
        setConnectionCode(result.connectionCode);
        setShowEmailForm(false);
      }
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Failed to save email');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const profileUrl = window.location.href;
      
      if (isMobileApp()) {
        await shareContent({
          title: `Connect with ${profile.name} on Dislink`,
          text: `Check out ${profile.name}'s profile on Dislink!`,
          url: profileUrl
        });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (err) {
      console.error('Error copying link:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Profile not found'}
          </h1>
          <p className="text-gray-600">
            This profile may have been removed or is not publicly available.
          </p>
          <div className="mt-8">
            <AppStoreButtons showTitle={true} size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            QR Code Expired
          </h1>
          <p className="text-gray-600 mb-8">
            This QR code has expired. Please ask {profile.name} to share a new QR code.
          </p>
          <AppStoreButtons showTitle={true} size="large" />
        </div>
      </div>
    );
  }

  if (connectionCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Connection Code Generated!
            </h1>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-2">Your Connection Code:</p>
              <p className="text-2xl font-mono font-bold text-indigo-600">
                {connectionCode}
              </p>
            </div>
            <p className="text-gray-600 mb-8">
              We've sent this code to your email. Download the app and enter this code during registration to connect with {profile.name}!
            </p>
            <AppStoreButtons size="large" />
          </div>
        </div>
      </div>
    );
  }

  // Extract allowed fields from public profile settings
  const allowedFields = profile.publicProfile?.allowedFields || {
    email: false,
    phone: false,
    company: true,
    jobTitle: true,
    bio: true,
    interests: true,
    location: true
  };

  // Extract shared social links
  const sharedLinks = profile.publicProfile?.defaultSharedLinks || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dislink Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg mr-3">
                <LinkIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Dislink
                </span>
                <p className="text-xs text-gray-500">Professional Networking</p>
              </div>
            </div>
            {scanLocation && (
              <div className="text-right">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{scanLocation.name || 'Location detected'}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Scanned {scanTimestamp.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"></div>
          </div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Relationship Quote */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                Every Great Relationship<br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Starts with a Single Connection
                </span>
              </h1>
              <p className="text-xl md:text-2xl opacity-90 font-light max-w-3xl mx-auto leading-relaxed">
                This is your moment to build something meaningful with <span className="font-semibold">{profile.name}</span>
              </p>
            </motion.div>
            
            {/* Connection CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-2xl mx-auto border border-white/20"
            >
              <h2 className="text-2xl font-bold mb-3">
                Connect with {profile.name}
              </h2>
              <p className="text-lg opacity-90 mb-6">
                Start tracking your professional relationship from this very moment
              </p>
              
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-xs opacity-75">Tracked</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium">Timeline</p>
                  <p className="text-xs opacity-75">Recorded</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium">Connection</p>
                  <p className="text-xs opacity-75">Lifetime</p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => {
                  const element = document.getElementById('connection-options');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="flex items-center justify-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start Your Connection Journey
                  <ArrowRight className="h-5 w-5 ml-2" />
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <LinkIcon className="h-8 w-8 text-white" />
          </motion.div>
        </div>
        
        <div className="absolute bottom-20 right-10 opacity-20">
          <motion.div
            animate={{ 
              y: [0, 15, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          >
            <Users className="h-10 w-10 text-white" />
          </motion.div>
        </div>
      </div>

      {/* Connection Options Section */}
      <div id="connection-options" className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Connection Method
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get connected and start tracking your relationship with {profile.name}
          </p>
        </div>

        {/* Profile Header */}
        <div className="bg-white shadow-sm relative z-10 mb-8">
          <div className="flex items-center space-x-6 bg-white rounded-xl shadow-lg p-6">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile.name}
                className="h-24 w-24 rounded-xl object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="h-24 w-24 rounded-xl bg-indigo-100 flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-4xl font-medium text-indigo-600">
                  {profile.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              {profile.jobTitle && (
                <p className="text-lg text-gray-600">
                  {profile.jobTitle}
                  {profile.company && (
                    <> at {profile.company}</>
                  )}
                </p>
              )}
              
              {/* Share button */}
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100"
                >
                  <Copy className="h-4 w-4 mr-1.5" />
                  {copySuccess ? 'Copied!' : 'Copy Link'}
                </button>
                <a
                  href={`mailto:?subject=Connect with ${profile.name} on Dislink&body=Check out ${profile.name}'s profile on Dislink: ${window.location.href}`}
                  className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100"
                >
                  <Share2 className="h-4 w-4 mr-1.5" />
                  Share
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Email Form */}
        {showEmailForm && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Choose Your Connection Method
              </h2>
              <p className="text-gray-600 text-lg">
                Get connected and start tracking your relationship
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Option 1: Get Connection Link */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-indigo-600" />
                  Get Connection Link
                </h3>
                <p className="text-gray-600 mb-4">
                  Receive a special link to use during registration
                </p>
                
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  {emailError && (
                    <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                      <div className="flex">
                        <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                        <div className="text-sm text-red-700">{emailError}</div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <input
                      type="email"
                      required
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Sending...
                      </div>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Get Connection Link
                      </>
                    )}
                  </button>
                </form>
              </div>
              
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
              
              {/* Option 2: Create Profile Directly */}
              <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-r from-green-50 to-emerald-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <UserPlus className="h-5 w-5 mr-2 text-green-600" />
                  Create Your Profile Now
                </h3>
                <p className="text-gray-600 mb-4">
                  Start using Dislink immediately with automatic connection tracking
                </p>
                
                <button
                  onClick={() => {
                    // Log the direct profile creation with scan tracking
                    console.log('Direct Profile Creation:', {
                      scannedProfile: profile.name,
                      scanLocation,
                      scanTimestamp: scanTimestamp.toISOString(),
                      action: 'create_profile_direct',
                      code,
                      timestamp: new Date().toISOString()
                    });
                    
                    // Store scan data for later use during registration
                    localStorage.setItem('qr_scan_data', JSON.stringify({
                      scannedProfile: {
                        userId: profile.userId,
                        name: profile.name,
                        jobTitle: profile.jobTitle,
                        company: profile.company,
                        profileImage: profile.profileImage
                      },
                      scanLocation,
                      scanTimestamp: scanTimestamp.toISOString(),
                      code
                    }));
                    
                    // Navigate to registration with tracking
                    window.location.href = '/app/register?from=qr_scan&connect=' + encodeURIComponent(profile.userId);
                  }}
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Create Profile & Connect
                </button>
                
                <div className="mt-4 text-xs text-green-700 bg-green-100 p-3 rounded-lg">
                  <div className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Automatic Connection Tracking:</p>
                      <ul className="mt-1 space-y-1">
                        <li>• Scan location and time saved</li>
                        <li>• Connection request sent automatically</li>
                        <li>• Relationship tracking starts immediately</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Benefits Section */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                Why Connect with {profile.name}?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <MapPin className="h-4 w-4 text-indigo-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Location Context</p>
                  <p className="text-xs text-gray-500">Remember where you met</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="h-4 w-4 text-indigo-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Smart Follow-ups</p>
                  <p className="text-xs text-gray-500">Never lose touch</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="h-4 w-4 text-indigo-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Relationship Growth</p>
                  <p className="text-xs text-gray-500">Track your network</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Profile Content */}
      {profile.publicProfile?.enabled && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Bio Section */}
          {allowedFields.bio && profile.bio && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <BookOpen className="h-6 w-6 mr-2" />
                  About
                </h2>
                <div className="space-y-6">
                  {/* Location Info */}
                  {allowedFields.location && (
                    <div className="flex flex-wrap gap-6">
                      {profile.bio?.location && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                          <span>Located in {profile.bio.location}</span>
                        </div>
                      )}
                      {profile.bio?.from && (
                        <div className="flex items-center text-gray-600">
                          <Globe className="h-5 w-5 mr-2 text-gray-400" />
                          <span>From {profile.bio.from}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bio Text */}
                  {profile.bio?.about && (
                    <div className="prose max-w-none">
                      <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                        {profile.bio.about}
                      </p>
                    </div>
                  )}

                  {/* Interests */}
                  {allowedFields.interests && profile.interests && profile.interests.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <Heart className="h-4 w-4 mr-2" />
                        Interests
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Social Links */}
          {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <LinkIcon className="h-6 w-6 mr-2" />
                  Connect with {profile.name}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(profile.socialLinks).map(([platform, url]) => {
                    // Skip if this platform is not shared
                    if (!sharedLinks[platform]) return null;
                    
                    // Find platform config
                    let platformConfig;
                    let categoryColor;
                    
                    for (const [categoryId, category] of Object.entries(SOCIAL_CATEGORIES)) {
                      if (category.links[platform]) {
                        platformConfig = category.links[platform];
                        categoryColor = category.color;
                        break;
                      }
                    }
                    
                    if (!platformConfig) return null;
                    
                    const Icon = platformConfig.icon;
                    
                    return (
                      <a
                        key={platform}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Icon 
                          className="h-5 w-5 mr-3"
                          style={{ color: platformConfig.color }}
                        />
                        <span className="font-medium text-gray-700">
                          {platformConfig.label}
                        </span>
                        <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Download App Section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              Download Dislink
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Build meaningful professional relationships with smart networking tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
            {[
              {
                icon: MapPin,
                title: 'Location Context',
                description: 'Save where and when you met someone automatically'
              },
              {
                icon: Clock,
                title: 'Smart Follow-ups',
                description: 'Get reminders to stay in touch with your connections'
              },
              {
                icon: Bell,
                title: 'Stay Updated',
                description: 'Get notified when connections update their contact info'
              },
              {
                icon: Users,
                title: 'Relationship Categories',
                description: 'Organize and categorize your professional relationships'
              }
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">{feature.title}</h3>
                  <p className="text-sm opacity-80">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <AppStoreButtons size="large" className="text-center" />
          </div>
        </div>
      </div>
    </div>
  );
}