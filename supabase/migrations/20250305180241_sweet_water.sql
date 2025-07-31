/*
  # Add Registration Tracking Fields

  1. Changes
    - Add registration tracking fields to profiles table
    - Add registration completion timestamp
    - Add registration status check constraint
    - Add index for registration status

  2. Security
    - Maintain existing RLS policies
*/

-- Add registration tracking fields if they don't exist
DO $$ 
BEGIN
  -- Add registration_complete field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'registration_complete'
  ) THEN
    ALTER TABLE profiles ADD COLUMN registration_complete boolean DEFAULT false;
  END IF;

  -- Add registration_completed_at field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'registration_completed_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN registration_completed_at timestamptz;
  END IF;

  -- Add registration_status field with check constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'registration_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN registration_status text DEFAULT 'pending';
    ALTER TABLE profiles ADD CONSTRAINT profiles_registration_status_check 
      CHECK (registration_status IN ('pending', 'in_progress', 'completed', 'verified'));
  END IF;
END $$;

-- Create index for registration status if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_profiles_registration_complete ON profiles(registration_complete);

-- Create function to handle registration completion
CREATE OR REPLACE FUNCTION handle_registration_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.registration_complete = true AND OLD.registration_complete = false THEN
    NEW.registration_completed_at = now();
    NEW.registration_status = 'completed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace trigger for registration completion
DROP TRIGGER IF EXISTS on_registration_complete ON profiles;
CREATE TRIGGER on_registration_complete
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.registration_complete IS DISTINCT FROM OLD.registration_complete)
  EXECUTE FUNCTION handle_registration_completion();