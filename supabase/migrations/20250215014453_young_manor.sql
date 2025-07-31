/*
  # Testing Infrastructure Setup

  1. New Tables
    - `test_users`
      - Stores test user accounts and credentials
      - Includes approval status and registration state
    - `test_profiles`
      - Stores test user profile data
      - Mirrors production profile structure with additional testing fields
    - `test_connections`
      - Stores test user connections and relationships
      - Includes meeting context and location data

  2. Security
    - Enable RLS on all test tables
    - Add policies for test data access
    - Separate test data from production

  3. Changes
    - Add testing-specific fields and metadata
    - Create indexes for performance
    - Add automatic timestamp handling
*/

-- Test Users Table
CREATE TABLE IF NOT EXISTS test_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  middle_name text,
  last_name text NOT NULL,
  company text,
  password_hash text NOT NULL,
  access_key text UNIQUE NOT NULL,
  approved boolean DEFAULT false,
  request_date timestamptz DEFAULT now(),
  approval_date timestamptz,
  registration_complete boolean DEFAULT false,
  two_factor_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Test Profiles Table
CREATE TABLE IF NOT EXISTS test_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES test_users(id) ON DELETE CASCADE NOT NULL,
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Test Connections Table
CREATE TABLE IF NOT EXISTS test_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES test_users(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  company text,
  job_title text,
  profile_image text,
  meeting_context text,
  meeting_date timestamptz,
  meeting_location jsonb,
  tags text[] DEFAULT '{}',
  notes jsonb[] DEFAULT '{}',
  follow_ups jsonb[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE test_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for test_users
CREATE POLICY "Test users can read own data"
  ON test_users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text OR auth.uid()::text = 'owner');

CREATE POLICY "Test users can update own data"
  ON test_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text OR auth.uid()::text = 'owner');

-- Create policies for test_profiles
CREATE POLICY "Test users can read own profile"
  ON test_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text OR auth.uid()::text = 'owner');

CREATE POLICY "Test users can update own profile"
  ON test_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text OR auth.uid()::text = 'owner');

-- Create policies for test_connections
CREATE POLICY "Test users can read own connections"
  ON test_connections
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text OR auth.uid()::text = 'owner');

CREATE POLICY "Test users can update own connections"
  ON test_connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text OR auth.uid()::text = 'owner');

-- Create indexes for performance
CREATE INDEX test_users_email_idx ON test_users(email);
CREATE INDEX test_users_access_key_idx ON test_users(access_key);
CREATE INDEX test_profiles_user_id_idx ON test_profiles(user_id);
CREATE INDEX test_connections_user_id_idx ON test_connections(user_id);
CREATE INDEX test_connections_contact_id_idx ON test_connections(contact_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_test_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for timestamp updates
CREATE TRIGGER update_test_users_timestamp
  BEFORE UPDATE ON test_users
  FOR EACH ROW
  EXECUTE FUNCTION update_test_updated_at();

CREATE TRIGGER update_test_profiles_timestamp
  BEFORE UPDATE ON test_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_test_updated_at();

CREATE TRIGGER update_test_connections_timestamp
  BEFORE UPDATE ON test_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_test_updated_at();