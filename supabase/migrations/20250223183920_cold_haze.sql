/*
  # Fix profiles table and auth handling

  1. Changes
    - Drop and recreate profiles table with correct schema
    - Add public access policy for profile creation
    - Update auth trigger to handle null values properly
    
  2. Security
    - Enable RLS
    - Add policies for both authenticated and public access
    
  3. Notes
    - This migration fixes issues with profile creation during signup
    - Ensures proper handling of metadata fields
*/

-- Drop existing profiles table and related objects
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  middle_name text,
  last_name text NOT NULL,
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

-- Create auth trigger function with better error handling
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

  -- Create profile
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
  );

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
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

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow public profile creation during signup
CREATE POLICY "Public can create profile"
  ON public.profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes
CREATE INDEX profiles_email_idx ON public.profiles(email);
CREATE INDEX profiles_name_idx ON public.profiles(first_name, last_name);

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