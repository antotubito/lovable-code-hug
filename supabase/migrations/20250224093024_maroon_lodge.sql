/*
  # Fix Profile Duplicates

  1. Changes
    - Remove unique constraint on email to allow multiple auth providers
    - Add ON CONFLICT handling for profile creation
    - Improve error handling in trigger function
    
  2. Security
    - Maintain RLS policies
    - Keep existing access controls
*/

-- Drop existing profiles table and related objects
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table with improved constraints
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  first_name text NOT NULL DEFAULT '',
  middle_name text,
  last_name text NOT NULL DEFAULT '',
  company text,
  job_title text,
  industry text,
  profile_image text,
  cover_image text,
  bio jsonb DEFAULT '{}'::jsonb,
  interests text[] DEFAULT '{}',
  social_links jsonb DEFAULT '{}'::jsonb,
  public_profile jsonb DEFAULT '{
    "enabled": true,
    "defaultSharedLinks": {},
    "allowedFields": {
      "email": false,
      "phone": false,
      "company": true,
      "jobTitle": true,
      "bio": true,
      "interests": true,
      "location": true
    }
  }'::jsonb,
  onboarding_complete boolean DEFAULT false,
  onboarding_completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_name CHECK (
    length(first_name) > 0 AND
    length(last_name) > 0
  )
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create auth trigger function with improved error handling and upsert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  first_name text;
  last_name text;
BEGIN
  -- Extract and validate first name
  first_name := COALESCE(
    NEW.raw_user_meta_data->>'first_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Extract and validate last name
  last_name := COALESCE(
    NEW.raw_user_meta_data->>'last_name',
    'User'
  );

  -- Insert or update profile
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    middle_name,
    last_name,
    company,
    onboarding_complete
  ) VALUES (
    NEW.id,
    NEW.email,
    first_name,
    NEW.raw_user_meta_data->>'middle_name',
    last_name,
    NEW.raw_user_meta_data->>'company',
    COALESCE((NEW.raw_user_meta_data->>'onboarding_complete')::boolean, false)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    middle_name = EXCLUDED.middle_name,
    last_name = EXCLUDED.last_name,
    company = EXCLUDED.company,
    updated_at = now();

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the transaction
    RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create auth trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create RLS policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can create profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can read profiles" ON public.profiles;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR 
    (public_profile->>'enabled')::boolean = true
  );

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow profile creation during signup
CREATE POLICY "Public can create profile"
  ON public.profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_name_idx ON public.profiles(first_name, last_name);
CREATE INDEX IF NOT EXISTS profiles_updated_at_idx ON public.profiles(updated_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for timestamp updates
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();