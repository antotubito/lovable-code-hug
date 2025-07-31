-- Drop existing objects if they exist
DO $$ 
BEGIN
  -- Drop existing triggers
  DROP TRIGGER IF EXISTS update_connection_request_timestamp ON connection_requests;
  DROP TRIGGER IF EXISTS handle_code_expiration_trigger ON connection_codes;
  
  -- Drop existing functions
  DROP FUNCTION IF EXISTS update_connection_request_timestamp();
  DROP FUNCTION IF EXISTS handle_code_expiration();
  DROP FUNCTION IF EXISTS expire_connection_codes();
  DROP FUNCTION IF EXISTS generate_connection_code();
  
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can read own connection codes" ON connection_codes;
  DROP POLICY IF EXISTS "Users can create own connection codes" ON connection_codes;
  DROP POLICY IF EXISTS "Users can update scanned codes" ON connection_codes;
  DROP POLICY IF EXISTS "Users can read own connection requests" ON connection_requests;
  DROP POLICY IF EXISTS "Users can create connection requests" ON connection_requests;
  DROP POLICY IF EXISTS "Users can update own connection requests" ON connection_requests;
  
  -- Drop existing tables
  DROP TABLE IF EXISTS connection_requests;
  DROP TABLE IF EXISTS connection_codes;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create connection_codes table
CREATE TABLE connection_codes (
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
CREATE TABLE connection_requests (
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
CREATE INDEX IF NOT EXISTS idx_connection_codes_user_id ON connection_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_codes_scanned_by ON connection_codes(scanned_by);
CREATE INDEX IF NOT EXISTS idx_connection_codes_status ON connection_codes(status);
CREATE INDEX IF NOT EXISTS idx_connection_requests_user_id ON connection_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_requester_id ON connection_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_status ON connection_requests(status);

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

-- Create function to handle code expiration on access
CREATE OR REPLACE FUNCTION handle_code_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND NEW.expires_at < now() THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to handle code expiration
CREATE TRIGGER handle_code_expiration_trigger
  BEFORE UPDATE OR INSERT ON connection_codes
  FOR EACH ROW
  EXECUTE FUNCTION handle_code_expiration();