import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Check, Lock, AlertCircle, Home, Timer, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

export function EmailConfirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [debugInfo, setDebugInfo] = useState<any>(null);

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

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get parameters from URL
        const token = searchParams.get('token_hash') || searchParams.get('token');
        const type = searchParams.get('type') || 'signup';
        const email = searchParams.get('email') || localStorage.getItem('confirmEmail');
        
        // Log all URL parameters for debugging
        const allParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          allParams[key] = value;
        });
        
        logger.info('Email verification parameters:', { 
          token: token ? `${token.substring(0, 5)}...` : 'missing',
          type,
          email: email ? `${email.substring(0, 3)}...` : 'missing',
          allParams
        });
        
        setDebugInfo({
          token: token ? `${token.substring(0, 5)}...` : 'missing',
          type,
          email: email ? `${email.substring(0, 3)}...` : 'missing',
          allParams
        });

        if (!token) {
          setError('Invalid confirmation link. The token is missing.');
          setLoading(false);
          return;
        }

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
              setSuccess(true);
              logger.info('User already confirmed');
              setLoading(false);
              return;
            } else if (error2.message?.includes('rate limit') || error2.message?.includes('security purposes')) {
              setCooldownTime(50);
              setError('Rate limit exceeded. Please try again in a moment.');
              setLoading(false);
              return;
            }
            
            // If both approaches failed, throw the error from the second attempt
            if (!verificationSuccessful) {
              throw error2;
            }
          }
        }

        // If verification was successful with any approach
        if (verificationSuccessful) {
          setSuccess(true);
          logger.info('Email verification successful');
        }
      } catch (err) {
        logger.error('Verification error:', err);
        setError(err instanceof Error ? err.message : 'Failed to verify email');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleContinue = () => {
    navigate('/app/login');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  const handleResendEmail = async () => {
    if (cooldownTime > 0) {
      setError(`Please wait ${cooldownTime} seconds before trying again`);
      return;
    }
    
    setResendingEmail(true);
    setError(null);
    setResendSuccess(false);

    try {
      const email = localStorage.getItem('confirmEmail');
      
      if (!email) {
        throw new Error('Email address not found. Please try signing up again.');
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm`
        }
      });

      if (error) {
        if (error.message?.includes('rate limit') || error.message?.includes('security purposes')) {
          setCooldownTime(50);
          throw new Error('For security purposes, you can only request this after 50 seconds.');
        }
        throw error;
      }
      
      setResendSuccess(true);
    } catch (error) {
      console.error('Error resending verification email:', error);
      setError(error instanceof Error ? error.message : 'Failed to resend verification email');
    } finally {
      setResendingEmail(false);
    }
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
            Verification Failed
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
              onClick={handleResendEmail}
              disabled={resendingEmail || cooldownTime > 0}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {resendingEmail ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Resending...
                </div>
              ) : cooldownTime > 0 ? (
                <div className="flex items-center">
                  <Timer className="h-4 w-4 mr-2" />
                  Retry in {cooldownTime}s
                </div>
              ) : (
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Verification Email
                </div>
              )}
            </button>
            <button
              onClick={() => navigate('/app/login')}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Return to Login
            </button>
            <button
              onClick={handleGoToHome}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Home Page
            </button>
          </div>
          {resendSuccess && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Verification email has been resent. Please check your inbox.</p>
            </div>
          )}
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
            🚀 Start the Journey
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