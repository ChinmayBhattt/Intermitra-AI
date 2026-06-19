-- Create todos table with user ownership
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own todos
CREATE POLICY "users_can_insert_own_todos" ON todos
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_read_own_todos" ON todos
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users_can_update_own_todos" ON todos
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_delete_own_todos" ON todos
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Allow authenticated SDK callers to reach the table; RLS still filters rows
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON todos TO authenticated;

-- Auto-update updated_at on every UPDATE
CREATE TRIGGER todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();
