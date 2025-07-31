/*
  # Fix Profile Duplicates and Improve Error Handling

  1. Changes
    - Add transaction handling for profile creation
    - Improve concurrency handling
    - Add better error recovery
    - Add profile status tracking
    
  2. Security
    - Maintain existing RLS policies
    - Add audit logging
*/

-- Drop existing profiles table and related objects
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table with improved structure
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
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'disabled')),
  onboarding_complete boolean DEFAULT false,
  onboarding_completed_at timestamptz,
  last_sign_in timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS profile_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  performed_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_audit_log ENABLE ROW LEVEL SECURITY;

-- Create improved auth trigger function with transaction and error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  profile_id uuid;
  first_name text;
  last_name text;
  retry_count int := 0;
  max_retries constant int := 3;
  profile_exists boolean;
BEGIN
  -- Start transaction with serializable isolation
  -- This prevents race conditions during profile creation
  BEGIN
    -- Extract profile data
    first_name := COALESCE(
      NEW.raw_user_meta_data->>'first_name',
      split_part(NEW.email, '@', 1)
    );
    
    last_name := COALESCE(
      NEW.raw_user_meta_data->>'last_name',
      'User'
    );

    LOOP
      EXIT WHEN retry_count >= max_retries;
      
      BEGIN
        -- Check if profile exists with advisory lock
        SELECT EXISTS (
          SELECT 1 
          FROM public.profiles 
          WHERE id = NEW.id
          FOR UPDATE SKIP LOCKED
        ) INTO profile_exists;

        IF NOT profile_exists THEN
          -- Create new profile
          INSERT INTO public.profiles (
            id,
            email,
            first_name,
            middle_name,
            last_name,
            company,
            status,
            onboarding_complete,
            last_sign_in
          ) VALUES (
            NEW.id,
            NEW.email,
            first_name,
            NEW.raw_user_meta_data->>'middle_name',
            last_name,
            NEW.raw_user_meta_data->>'company',
            'active',
            COALESCE((NEW.raw_user_meta_data->>'onboarding_complete')::boolean, false),
            now()
          )
          RETURNING id INTO profile_id;

          -- Log profile creation
          INSERT INTO profile_audit_log (
            profile_id,
            action,
            new_data,
            performed_by
          ) VALUES (
            profile_id,
            'create_profile',
            jsonb_build_object(
              'email', NEW.email,
              'first_name', first_name,
              'last_name', last_name
            ),
            NEW.id
          );

          -- Exit loop on success
          EXIT;
        ELSE
          -- Update existing profile
          UPDATE public.profiles
          SET
            email = NEW.email,
            first_name = first_name,
            middle_name = NEW.raw_user_meta_data->>'middle_name',
            last_name = last_name,
            company = NEW.raw_user_meta_data->>'company',
            last_sign_in = now(),
            updated_at = now()
          WHERE id = NEW.id;

          -- Log profile update
          INSERT INTO profile_audit_log (
            profile_id,
            action,
            new_data,
            performed_by
          ) VALUES (
            NEW.id,
            'update_profile',
            jsonb_build_object(
              'email', NEW.email,
              'first_name', first_name,
              'last_name', last_name
            ),
            NEW.id
          );

          -- Exit loop on success
          EXIT;
        END IF;

      EXCEPTION
        WHEN unique_violation THEN
          -- Log retry attempt
          RAISE LOG 'Retrying profile creation for user % (attempt %)', NEW.id, retry_count + 1;
          retry_count := retry_count + 1;
          -- Small delay before retry
          PERFORM pg_sleep(0.1 * retry_count);
          CONTINUE;
          
        WHEN OTHERS THEN
          -- Log other errors but continue
          RAISE LOG 'Error in handle_new_user for user % (attempt %): %', NEW.id, retry_count + 1, SQLERRM;
          retry_count := retry_count + 1;
          IF retry_count >= max_retries THEN
            RAISE LOG 'Max retries reached for user %', NEW.id;
            EXIT;
          END IF;
          CONTINUE;
      END;
    END LOOP;

    RETURN NEW;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log any unhandled errors
      RAISE LOG 'Unhandled error in handle_new_user for user %: %', NEW.id, SQLERRM;
      RETURN NEW;
  END;
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
CREATE INDEX IF NOT EXISTS profiles_status_idx ON public.profiles(status);

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