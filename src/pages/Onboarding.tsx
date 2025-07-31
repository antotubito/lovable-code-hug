import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Building2, Briefcase, Calendar, Heart,
  Globe, Camera, Sparkles, LinkIcon, LogOut, Check, ArrowLeft, X 
} from 'lucide-react';
import { OnboardingStep } from '../components/onboarding/OnboardingStep';
import { AnimatedInput } from '../components/onboarding/AnimatedInput';
import { AnimatedButton } from '../components/onboarding/AnimatedButton';
import { SocialLinksStep } from '../components/onboarding/SocialLinksStep';
import { LocationStep } from '../components/onboarding/LocationStep';
import { updateProfile } from '../lib/profile';
import { useAuth } from '../components/auth/AuthProvider';
import { FaceVerification } from '../components/verification/FaceVerification';
import { supabase } from '../lib/supabase';
import { JobTitleInput } from '../components/profile/JobTitleInput';
import { IndustrySelect } from '../components/profile/IndustrySelect';
import { Industry } from '../types/industry';

type OnboardingStep = 'welcome' | 'basics' | 'work' | 'location' | 'photo' | 'social' | 'complete';

const STEPS = ['welcome', 'basics', 'work', 'location', 'photo', 'social', 'complete'] as const;

function calculateAge(birthday: string): number {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    birthday: '',
    jobTitle: user?.jobTitle || '',
    company: user?.company || '',
    industry: user?.industry || undefined as Industry | undefined,
    location: user?.bio?.location || '',
    from: user?.bio?.from || '',
    profileImage: user?.profileImage || '',
    socialLinks: user?.socialLinks || {}
  });

  const currentStepIndex = STEPS.indexOf(step) + 1;
  const totalSteps = STEPS.length;

  useEffect(() => {
    async function checkAccess() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/app/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('id', session.user.id)
          .single();

        if (profile?.onboarding_complete) {
          navigate('/app');
        }
      } catch (error) {
        console.error('Error checking onboarding access:', error);
        navigate('/app/login');
      }
    }

    checkAccess();
  }, []);

  useEffect(() => {
    const savedProgress = localStorage.getItem('onboarding_progress');
    if (savedProgress) {
      try {
        const { step: savedStep, formData: savedData } = JSON.parse(savedProgress);
        setStep(savedStep);
        setFormData(savedData);
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (step !== 'complete') {
      const currentProgress = {
        step,
        formData
      };
      localStorage.setItem('onboarding_progress', JSON.stringify(currentProgress));
    }
  }, [step, formData]);

  const handleLocationUpdate = (locationData: { location: string; from: string }) => {
    setFormData({
      ...formData,
      location: locationData.location,
      from: locationData.from
    });
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current session to ensure we have the user ID
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        jobTitle: formData.jobTitle,
        company: formData.company,
        industry: formData.industry,
        profileImage: formData.profileImage,
        socialLinks: formData.socialLinks,
        bio: {
          location: formData.location,
          from: formData.from,
          about: ''
        },
        onboardingComplete: true,
        onboardingCompletedAt: new Date()
      });

      localStorage.removeItem('onboarding_progress');

      setStep('complete');
    } catch (err) {
      console.error('Onboarding completion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    try {
      await refreshUser();
      navigate('/app');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setError('Failed to complete onboarding');
    }
  };

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    const currentProgress = {
      step,
      formData
    };
    localStorage.setItem('onboarding_progress', JSON.stringify(currentProgress));
    
    navigate('/waitlist');
  };

  const handlePhotoCapture = (photoData: string) => {
    setFormData(prev => ({ ...prev, profileImage: photoData }));
    setError(null);
  };

  const handlePhotoError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const validateBasicInfo = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.birthday) {
      setError('All fields are required');
      return false;
    }

    const age = calculateAge(formData.birthday);
    if (age < 12) {
      setError('You must be at least 12 years old to use this app');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleBasicsSubmit = () => {
    setError(null);
    if (validateBasicInfo()) {
      setStep('work');
    }
  };

  const handleSocialLinksUpdate = (links: Record<string, string>) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: links
    }));
  };

  const renderWelcomeStep = () => (
    <OnboardingStep
      title="Welcome to Dislink! 🎉"
      description="Let's get your profile set up in just a few steps"
      icon={Sparkles}
      step={currentStepIndex}
      totalSteps={totalSteps}
    >
      <div className="space-y-6">
        <p className="text-gray-600">
          We're excited to help you build meaningful connections! This quick setup will help others find and connect with you.
        </p>
        <AnimatedButton onClick={() => setStep('basics')}>
          Let's Get Started
        </AnimatedButton>
      </div>
    </OnboardingStep>
  );

  const renderBasicsStep = () => (
    <OnboardingStep
      title="Nice to meet you! 👋"
      description="First, tell us a bit about yourself"
      icon={User}
      step={currentStepIndex}
      totalSteps={totalSteps}
      error={error}
    >
      <div className="space-y-6">
        <AnimatedInput
          label="First Name"
          icon={User}
          placeholder="Your first name"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          required
        />
        <AnimatedInput
          label="Last Name"
          icon={User}
          placeholder="Your last name"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          required
        />
        <AnimatedInput
          label="Email"
          icon={Mail}
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <div>
          <AnimatedInput
            label="When's your birthday?"
            icon={Calendar}
            type="date"
            value={formData.birthday}
            onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
            required
            max={new Date().toISOString().split('T')[0]}
          />
          <p className="mt-1 text-sm text-gray-500">
            You must be at least 12 years old to use Dislink
          </p>
        </div>
        <div className="flex space-x-3">
          <AnimatedButton
            variant="secondary"
            onClick={() => setStep('welcome')}
            icon={ArrowLeft}
          >
            Back
          </AnimatedButton>
          <AnimatedButton
            onClick={handleBasicsSubmit}
          >
            Continue
          </AnimatedButton>
        </div>
      </div>
    </OnboardingStep>
  );

  const renderWorkStep = () => (
    <OnboardingStep
      title="What do you do? 💼"
      description="Tell us about your professional life"
      icon={Briefcase}
      step={currentStepIndex}
      totalSteps={totalSteps}
    >
      <div className="space-y-6">
        <IndustrySelect
          value={formData.industry}
          onChange={(industry) => setFormData({ ...formData, industry })}
          required
        />
        
        <JobTitleInput
          value={formData.jobTitle}
          onChange={(value) => setFormData({ ...formData, jobTitle: value })}
          industry={formData.industry}
          required
        />
        
        <AnimatedInput
          label="Company"
          icon={Building2}
          placeholder="Where do you work?"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          required
        />
        <div className="flex space-x-3">
          <AnimatedButton
            variant="secondary"
            onClick={() => setStep('basics')}
            icon={ArrowLeft}
          >
            Back
          </AnimatedButton>
          <AnimatedButton
            onClick={() => setStep('location')}
            disabled={!formData.jobTitle || !formData.company}
          >
            Continue
          </AnimatedButton>
        </div>
      </div>
    </OnboardingStep>
  );

  const renderLocationStep = () => (
    <OnboardingStep
      title="Where in the world? 🌎"
      description="Tell us where you're based"
      icon={Globe}
      step={currentStepIndex}
      totalSteps={totalSteps}
      error={error}
    >
      <LocationStep
        location={formData.location}
        from={formData.from}
        onUpdate={handleLocationUpdate}
        onNext={() => setStep('photo')}
        onBack={() => setStep('work')}
      />
    </OnboardingStep>
  );

  const renderPhotoStep = () => (
    <OnboardingStep
      title="Show us your smile! 📸"
      description="Add a profile photo so others can recognize you"
      icon={Camera}
      step={currentStepIndex}
      totalSteps={totalSteps}
    >
      <div className="space-y-6">
        <FaceVerification
          onVerified={handlePhotoCapture}
          onError={handlePhotoError}
        />

        <div className="flex space-x-3">
          <AnimatedButton
            variant="secondary"
            onClick={() => setStep('location')}
            icon={ArrowLeft}
          >
            Back
          </AnimatedButton>
          <AnimatedButton
            onClick={() => setStep('social')}
          >
            {formData.profileImage ? 'Continue' : 'Skip for now'}
          </AnimatedButton>
        </div>
      </div>
    </OnboardingStep>
  );

  const renderSocialStep = () => (
    <OnboardingStep
      title="Connect your world! 🌎"
      description="Add your social profiles to make connecting easier"
      icon={Globe}
      step={currentStepIndex}
      totalSteps={totalSteps}
      error={error}
    >
      <SocialLinksStep
        socialLinks={formData.socialLinks}
        onUpdate={handleSocialLinksUpdate}
        onNext={handleComplete}
        onBack={() => setStep('photo')}
      />
    </OnboardingStep>
  );

  const renderCompleteStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto text-center"
    >
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Dislink! 🎉
        </h2>
        
        <p className="text-lg text-gray-600 mb-8">
          Your profile is all set up and ready to go. Start connecting with amazing people and grow your network!
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-indigo-50 rounded-lg text-left">
            <h3 className="font-medium text-indigo-900 mb-2">What's Next?</h3>
            <ul className="space-y-2 text-indigo-700">
              <li className="flex items-center">
                <Check className="h-5 w-5 mr-2 text-indigo-500" />
                Explore your personalized dashboard
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 mr-2 text-indigo-500" />
                Connect with people you know
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 mr-2 text-indigo-500" />
                Share your unique profile link
              </li>
            </ul>
          </div>

          <AnimatedButton
            onClick={handleFinish}
            className="w-full"
          >
            Get Started
          </AnimatedButton>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto relative">
        {step !== 'complete' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExit}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </motion.button>
        )}

        <AnimatePresence>
          {showExitConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-md w-full"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Exit Onboarding?
                </h3>
                <p className="text-gray-600 mb-6">
                  Your progress will be saved, and you can continue later from where you left off.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowExitConfirm(false)}
                    className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmExit}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Exit
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 'welcome' && renderWelcomeStep()}
          {step === 'basics' && renderBasicsStep()}
          {step === 'work' && renderWorkStep()}
          {step === 'location' && renderLocationStep()}
          {step === 'photo' && renderPhotoStep()}
          {step === 'social' && renderSocialStep()}
          {step === 'complete' && renderCompleteStep()}
        </AnimatePresence>
      </div>
    </div>
  );
}