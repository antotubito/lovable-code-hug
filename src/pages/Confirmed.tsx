import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Home, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

export function Confirmed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // On mount, try to verify the email if there are URL parameters
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get parameters from URL
        const token = searchParams.get('token_hash') || searchParams.get('token');
        const type = searchParams.get('type') || 'signup';
        const email = searchParams.get('email') || localStorage.getItem('confirmEmail');
        
        // If no token in URL, assume already confirmed and just show success
        if (!token) {
          logger.info('No token in URL, assuming already confirmed');
          setLoading(false);
          return;
        }
        
        // Log all URL parameters for debugging
        const allParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          allParams[key] = value;
        });
        
        logger.info('Email confirmation parameters:', { 
          token: token ? `${token.substring(0, 5)}...` : 'missing',
          type,
          email: email ? `${email.substring(0, 3)}...` : 'missing',
          allParams
        });
        
        setDebugInfo({
          token: token ? `${token.substring(0, 5)}...` : 'missing',
          type,
          email: email ? `${email.substring(0, 3)}...` : 'missing',
          allParams,
          url: window.location.href
        });

        // Try different verification approaches
        let verificationSuccessful = false;
        
        // Approach 1: Use token_hash with email
        if (email) {
          logger.info('Attempting verification with email and token_hash');
          const { data: data1, error: error1 } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as any,
            email
          });
          
          if (!error1) {
            verificationSuccessful = true;
            logger.info('Verification successful with email and token_hash');
          } else {
            logger.warn('Verification failed with email and token_hash:', error1);
          }
        }
        
        // Approach 2: Use token_hash without email if first approach failed
        if (!verificationSuccessful) {
          logger.info('Attempting verification with token_hash only');
          const { data: data2, error: error2 } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as any
          });
          
          if (!error2) {
            verificationSuccessful = true;
            logger.info('Verification successful with token_hash only');
          } else {
            logger.warn('Verification failed with token_hash only:', error2);
            
            // Check if error is due to already verified email
            if (error2.message?.includes('User already confirmed')) {
              logger.info('User already confirmed');
              verificationSuccessful = true;
            } else if (error2.message?.includes('rate limit') || error2.message?.includes('security purposes')) {
              setError('Rate limit exceeded. Please try again in a moment.');
            } else if (!verificationSuccessful) {
              throw error2;
            }
          }
        }

        // If verification was successful with any approach
        if (verificationSuccessful) {
          logger.info('Email verification successful');
          
          // Try to get the session to ensure it was created
          const { data: { session } } = await supabase.auth.getSession();
          logger.info('Session after verification:', { 
            hasSession: !!session,
            userId: session?.user?.id
          });
        }
      } catch (err) {
        logger.error('Verification error:', err);
        setError(err instanceof Error ? err.message : 'Failed to verify email');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleContinue = () => {
    navigate('/app/login');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-900">Verifying your email...</h2>
          <p className="mt-2 text-gray-500">This will only take a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-8 rounded-xl shadow-xl text-center"
        >
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Verification Issue
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          
          {debugInfo && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left text-xs text-gray-500 overflow-auto max-h-40">
              <p className="font-semibold mb-1">Debug Information:</p>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleContinue}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Try Signing In
            </button>
            <button
              onClick={handleGoToHome}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Home Page
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        className="max-w-md w-full bg-white p-8 rounded-xl shadow-xl text-center"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6"
        >
          <Check className="h-10 w-10 text-green-600" />
        </motion.div>
        
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-900 mb-4"
        >
          ✅ Your email has been successfully confirmed!
        </motion.h2>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-8"
        >
          Thank you for verifying your email address. Your account is now active and ready to use.
        </motion.p>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col space-y-3"
        >
          <button
            onClick={handleContinue}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            🚀 Sign In Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          
          <button
            onClick={handleGoToHome}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Home className="h-5 w-5 mr-2" />
            Go to Home Page
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}