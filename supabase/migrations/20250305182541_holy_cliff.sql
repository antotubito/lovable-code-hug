/*
  # QR Code and Connection Tracking

  1. New Tables
    - `connection_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `user_id` (uuid, references profiles)
      - `scanned_by` (uuid, references profiles)
      - `scanned_at` (timestamp)
      - `location` (jsonb)
      - `status` (text)
      - `created_at` (timestamp)
      - `expires_at` (timestamp)

  2. Functions
    - `auto_generate_code()`: Generates unique connection codes
    - `handle_code_expiration()`: Manages code expiration
    - `check_code_expiration()`: Validates code expiration

  3. Security
    - Enable RLS on connection_codes table
    - Add policies for:
      - Creating codes (owner only)
      - Reading codes (owner and scanner)
      - Updating codes (owner and scanner)
*/

-- Drop existing triggers if they exist
DO $$ BEGIN
  DROP TRIGGER IF EXISTS auto_generate_code_trigger ON connection_codes;
  DROP TRIGGER IF EXISTS handle_code_expiration_trigger ON connection_codes;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS auto_generate_code();
DROP FUNCTION IF EXISTS handle_code_expiration();
DROP FUNCTION IF EXISTS check_code_expiration();

-- Create connection_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS connection_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scanned_by uuid REFERENCES profiles(id),
  scanned_at timestamptz,
  location jsonb,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  CONSTRAINT connection_codes_status_check CHECK (status IN ('active', 'used', 'expired'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_connection_codes_code ON connection_codes(code);
CREATE INDEX IF NOT EXISTS idx_connection_codes_user_id ON connection_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_codes_scanned_by ON connection_codes(scanned_by);
CREATE INDEX IF NOT EXISTS idx_connection_codes_status ON connection_codes(status);

-- Function to generate unique connection codes
CREATE OR REPLACE FUNCTION auto_generate_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate a random 8-character code
    new_code := substr(md5(random()::text), 1, 8);
    
    -- Check if code exists
    SELECT EXISTS (
      SELECT 1 FROM connection_codes WHERE code = new_code
    ) INTO code_exists;
    
    -- Exit loop if unique code found
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  -- Set the generated code
  NEW.code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle code expiration
CREATE OR REPLACE FUNCTION handle_code_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if code is expired
  IF NEW.expires_at <= now() THEN
    NEW.status := 'expired';
  END IF;
  
  -- Mark as used if scanned
  IF NEW.scanned_by IS NOT NULL AND NEW.status = 'active' THEN
    NEW.status := 'used';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if code is expired
CREATE OR REPLACE FUNCTION check_code_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'Code has expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER auto_generate_code_trigger
  BEFORE INSERT ON connection_codes
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_code();

CREATE TRIGGER handle_code_expiration_trigger
  BEFORE INSERT OR UPDATE ON connection_codes
  FOR EACH ROW
  EXECUTE FUNCTION handle_code_expiration();

-- Enable RLS
ALTER TABLE connection_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Connection codes can be created by owner" ON connection_codes;
DROP POLICY IF EXISTS "Connection codes can be read by owner or scanner" ON connection_codes;
DROP POLICY IF EXISTS "Connection codes can be updated by owner or scanner" ON connection_codes;

-- RLS Policies
CREATE POLICY "Connection codes can be created by owner"
  ON connection_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Connection codes can be read by owner or scanner"
  ON connection_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = scanned_by);

CREATE POLICY "Connection codes can be updated by owner or scanner"
  ON connection_codes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR (auth.uid() = scanned_by AND status = 'active'));