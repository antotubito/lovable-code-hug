-- Add registration_complete column and related fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS registration_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS registration_completed_at timestamptz;

-- Update existing profiles to have registration_complete true if they've completed onboarding
UPDATE profiles 
SET 
  registration_complete = onboarding_complete,
  registration_completed_at = onboarding_completed_at
WHERE onboarding_complete = true;

-- Create index for registration_complete column
CREATE INDEX IF NOT EXISTS idx_profiles_registration_complete 
ON profiles(registration_complete);

-- Update handle_new_user function to include registration fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  profile_id uuid;
  profile_exists boolean;
  retry_count int := 0;
  max_retries constant int := 3;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = NEW.id
  ) INTO profile_exists;

  -- Only create profile if it doesn't exist
  IF NOT profile_exists THEN
    INSERT INTO public.profiles (
      id,
      email,
      first_name,
      middle_name,
      last_name,
      company,
      registration_complete,
      onboarding_complete
    ) VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
      NEW.raw_user_meta_data->>'middle_name',
      COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
      NEW.raw_user_meta_data->>'company',
      false,
      false
    ) RETURNING id INTO profile_id;

    -- Log successful profile creation
    RAISE LOG 'Created profile for user %', NEW.id;
  ELSE
    RAISE LOG 'Profile already exists for user %', NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the transaction
    RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;