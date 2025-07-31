/*
  # Add Realtime Updates Support
  
  1. New Tables
    - `profile_updates`
      - Tracks changes to user profiles
      - Enables real-time sync across devices
      
  2. Security
    - Enable RLS
    - Add policies for authenticated users
    
  3. Functions
    - Add trigger for profile updates
*/

-- Create profile updates table
CREATE TABLE IF NOT EXISTS profile_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  field_name text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profile_updates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own profile updates"
  ON profile_updates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to handle profile updates
CREATE OR REPLACE FUNCTION handle_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profile_updates for changed fields
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    INSERT INTO profile_updates (user_id, field_name, old_value, new_value)
    VALUES (NEW.id, 'name', to_jsonb(OLD.name), to_jsonb(NEW.name));
  END IF;

  IF NEW.job_title IS DISTINCT FROM OLD.job_title THEN
    INSERT INTO profile_updates (user_id, field_name, old_value, new_value)
    VALUES (NEW.id, 'job_title', to_jsonb(OLD.job_title), to_jsonb(NEW.job_title));
  END IF;

  IF NEW.company IS DISTINCT FROM OLD.company THEN
    INSERT INTO profile_updates (user_id, field_name, old_value, new_value)
    VALUES (NEW.id, 'company', to_jsonb(OLD.company), to_jsonb(NEW.company));
  END IF;

  IF NEW.bio IS DISTINCT FROM OLD.bio THEN
    INSERT INTO profile_updates (user_id, field_name, old_value, new_value)
    VALUES (NEW.id, 'bio', to_jsonb(OLD.bio), to_jsonb(NEW.bio));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile updates
CREATE TRIGGER on_profile_update
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_profile_update();

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE profile_updates;