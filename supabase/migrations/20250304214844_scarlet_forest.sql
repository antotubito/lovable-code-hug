/*
  # Connection Tracking Schema

  1. New Tables
    - `connection_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `user_id` (uuid, references profiles)
      - `scanned_by` (uuid, references profiles)
      - `scanned_at` (timestamptz)
      - `location` (jsonb)
      - `status` (text)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)

    - `connection_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `requester_id` (uuid, references profiles)
      - `code_id` (uuid, references connection_codes)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create connection_codes table
CREATE TABLE IF NOT EXISTS connection_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scanned_by uuid REFERENCES profiles(id),
  scanned_at timestamptz,
  location jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Create connection_requests table
CREATE TABLE IF NOT EXISTS connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  code_id uuid REFERENCES connection_codes(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE connection_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for connection_codes
CREATE POLICY "Users can read own connection codes"
  ON connection_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = scanned_by);

CREATE POLICY "Users can create own connection codes"
  ON connection_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update scanned codes"
  ON connection_codes
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    (auth.uid() = scanned_by AND status = 'active')
  );

-- Create policies for connection_requests
CREATE POLICY "Users can read own connection requests"
  ON connection_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = requester_id);

CREATE POLICY "Users can create connection requests"
  ON connection_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update own connection requests"
  ON connection_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = requester_id);

-- Create indexes
CREATE INDEX connection_codes_user_id_idx ON connection_codes(user_id);
CREATE INDEX connection_codes_scanned_by_idx ON connection_codes(scanned_by);
CREATE INDEX connection_codes_status_idx ON connection_codes(status);
CREATE INDEX connection_requests_user_id_idx ON connection_requests(user_id);
CREATE INDEX connection_requests_requester_id_idx ON connection_requests(requester_id);
CREATE INDEX connection_requests_status_idx ON connection_requests(status);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_connection_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for timestamp updates
CREATE TRIGGER update_connection_request_timestamp
  BEFORE UPDATE ON connection_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_connection_request_timestamp();

-- Create function to generate unique connection code
CREATE OR REPLACE FUNCTION generate_connection_code()
RETURNS text AS $$
DECLARE
  chars text[] := '{A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,U,V,W,X,Y,Z,2,3,4,5,6,7,8,9}';
  result text := '';
  i integer := 0;
  code_exists boolean;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || chars[1+random()*(array_length(chars, 1)-1)];
    END LOOP;
    
    -- Check if code already exists
    SELECT EXISTS (
      SELECT 1 FROM connection_codes WHERE code = result
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Create function to handle connection code expiration
CREATE OR REPLACE FUNCTION expire_connection_codes()
RETURNS void AS $$
BEGIN
  UPDATE connection_codes
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create function to check code expiration on read
CREATE OR REPLACE FUNCTION check_code_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- Update expired codes when accessed
  IF NEW.status = 'active' AND NEW.expires_at < now() THEN
    UPDATE connection_codes
    SET status = 'expired'
    WHERE id = NEW.id;
    
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check expiration on read
CREATE TRIGGER check_code_expiration_on_read
  BEFORE UPDATE ON connection_codes
  FOR EACH ROW
  EXECUTE FUNCTION check_code_expiration();