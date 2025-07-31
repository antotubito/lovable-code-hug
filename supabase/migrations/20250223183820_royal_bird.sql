/*
  # Fix profiles table and auth trigger

  1. Changes
    - Ensure profiles table exists with correct schema
    - Create auth trigger to automatically create profile on signup
    - Add RLS policies for proper access control
    - Add indexes for performance
    
  2. Security
    - Enable RLS
    - Add policies for authenticated users
    
  3. Notes
    - This migration consolidates and fixes previous profile-related migrations
    - Ensures proper profile creation on user signup
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
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
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create auth trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    NEW.raw_user_meta_data->>'middle_name',
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'company',
    COALESCE((NEW.raw_user_meta_data->>'onboarding_complete')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create auth trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create RLS policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create indexes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_name_idx ON public.profiles(first_name, last_name);

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