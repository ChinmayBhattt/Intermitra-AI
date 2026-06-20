-- Add description and alarm columns to todos table
ALTER TABLE todos ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE todos ADD COLUMN IF NOT EXISTS alarm_at TIMESTAMPTZ DEFAULT NULL;
