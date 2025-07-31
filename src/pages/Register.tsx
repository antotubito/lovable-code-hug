import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import { ArrowLeft, Mail, Lock, Sparkles, AlertCircle, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { signUp } from '../lib/auth';
import type { RegistrationData } from '../types/user';
import { sessionManager } from '../lib/sessionManager';
import { logger } from '../lib/logger';
import { supabase } from '../lib/supabase';

export function Register() {
  const navigate = useNavigate();
  const { refreshUser, connectionStatus } = useAuth();
  const [formData, setFormData] = useState<RegistrationData & { confirmPassword: string }>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null | React.ReactNode>(null);
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  // Check for existing session
  useEffect(() => {
    if (sessionManager.hasSession()) {
      navigate('/app');
    }
  }, [navigate]);

  // Cooldown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check if in cooldown period
    if (cooldownTime > 0) {
      setError(`Please wait ${cooldownTime} seconds before trying again`);
      return;
    }

    // Validate form data
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Check connection status first
      if (connectionStatus === 'disconnected') {
        setError('You appear to be offline. Please check your internet connection and try again.');
        setLoading(false);
        return;
      }
      
      // Store email temporarily for verification
      localStorage.setItem('confirmEmail', formData.email);
      
      logger.info('Submitting registration form', { 
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      
      // Create account with explicit redirect URL
      await signUp({
        ...formData,
        emailRedirectTo: `${window.location.origin}/confirmed`
      });
      
      logger.info('Registration successful, showing verification prompt');
      
      // Show verification prompt
      setShowVerificationPrompt(true);
      
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('already exists')) {
          setError(
            <div className="text-sm">
              An account with this email already exists.{' '}
              <Link to="/app/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                Sign in instead
              </Link>
            </div>
          );
        } else if (err.message.includes('security purposes') || err.message.includes('rate limit')) {
          // Set cooldown timer for 50 seconds
          setCooldownTime(50);
          setError(
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-yellow-500" />
              <span>Please wait {cooldownTime} seconds before trying again</span>
            </div>
          );
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to create account. Please try again.');
      }
      
      // Clear stored email on error
      localStorage.removeItem('confirmEmail');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (cooldownTime > 0) {
      setError(`Please wait ${cooldownTime} seconds before trying again`);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const email = formData.email;
      if (!email) {
        throw new Error('Email address is missing');
      }
      
      logger.info('Resending verification email', { email });
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/confirmed`
        }
      });
      
      if (error) {
        if (error.message.includes('rate limit') || error.message.includes('security purposes')) {
          setCooldownTime(50);
          throw new Error('For security purposes, you can only request this after 50 seconds.');
        }
        throw error;
      }
      
      setError('Verification email resent. Please check your inbox.');
    } catch (err) {
      console.error('Error resending verification:', err);
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  if (showVerificationPrompt) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
      >
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-xl text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-6">
            <Mail className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Check Your Email! ✨
          </h2>
          <p className="text-gray-600 mb-6">
            We've sent a verification link to <strong>{formData.email}</strong>. 
            Click the link to activate your account and start connecting!
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <p className="text-sm text-gray-500 mb-4">
            Can't find the email? Check your spam folder
            {cooldownTime === 0 ? (
              <> or{' '}
                <button
                  onClick={handleResendVerification}
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  click here to resend
                </button>
              </>
            ) : (
              <> • Can resend in {cooldownTime}s</>
            )}
          </p>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              to="/app/login"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Return to login page
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
          <Sparkles className="h-10 w-10 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Hey there! 👋</h1>
        <p className="mt-2 text-xl text-gray-600">Let's get you started with Dislink</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 rounded-xl shadow-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="firstName"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Your first name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Your last name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                id="password"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a strong password"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                id="confirmPassword"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Must be at least 8 characters with uppercase, lowercase, number, and special character
            </p>
          </div>

          <div className="text-sm">
            <p className="text-gray-500">
              By creating an account, you agree to our{' '}
              <Link to="/app/terms" className="text-indigo-600 hover:text-indigo-500 font-medium">
                Terms & Conditions
              </Link>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || cooldownTime > 0}
            className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Creating Account...
              </div>
            ) : cooldownTime > 0 ? (
              <div className="flex items-center">
                <Timer className="h-5 w-5 mr-2" />
                Wait {cooldownTime}s
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/app/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/waitlist"
            className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}