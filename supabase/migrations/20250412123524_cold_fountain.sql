/*
  # Add User Preferences Support

  1. Changes
    - Add preferences JSONB column to profiles table
    - Add index for efficient querying
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add preferences column to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'preferences'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create index for preferences column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_profiles_preferences'
  ) THEN
    CREATE INDEX idx_profiles_preferences ON profiles USING GIN (preferences);
  END IF;
END $$;

-- Add function to handle preference updates
CREATE OR REPLACE FUNCTION handle_preference_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Log preference updates
  INSERT INTO profile_audit_log (
    profile_id,
    action,
    old_data,
    new_data,
    performed_by
  ) VALUES (
    NEW.id,
    'update_preferences',
    jsonb_build_object('preferences', OLD.preferences),
    jsonb_build_object('preferences', NEW.preferences),
    auth.uid()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for preference updates if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_preference_update'
  ) THEN
    CREATE TRIGGER on_preference_update
      BEFORE UPDATE OF preferences ON profiles
      FOR EACH ROW
      WHEN (NEW.preferences IS DISTINCT FROM OLD.preferences)
      EXECUTE FUNCTION handle_preference_update();
  END IF;
END $$;