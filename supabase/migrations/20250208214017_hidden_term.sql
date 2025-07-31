/*
  # Security Questions Schema Updates

  1. Changes
    - Add question_order column to security_questions table
    - Add max questions constraint
    - Add additional indexes for performance
  
  2. Security
    - No changes to existing RLS policies
*/

-- Add question_order column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'security_questions' 
    AND column_name = 'question_order'
  ) THEN
    ALTER TABLE security_questions 
    ADD COLUMN question_order integer DEFAULT 0;
  END IF;
END $$;

-- Add constraint to limit questions per user if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'max_questions_per_user'
  ) THEN
    ALTER TABLE security_questions
    ADD CONSTRAINT max_questions_per_user
    CHECK (
      question_order >= 0 AND 
      question_order < 5
    );
  END IF;
END $$;

-- Add composite index for faster lookups if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'security_questions_user_order_idx'
  ) THEN
    CREATE INDEX security_questions_user_order_idx 
    ON security_questions(user_id, question_order);
  END IF;
END $$;