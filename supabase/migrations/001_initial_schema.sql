-- DMVIron Gym SaaS Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Staff profiles linked to Supabase Auth
CREATE TABLE staff_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membership plans
CREATE TABLE membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('monthly', 'quarterly', 'annual')),
  price_cents INTEGER NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gym members
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  plan_id UUID REFERENCES membership_plans(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'paused', 'cancelled')),
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  renewal_date DATE,
  archived BOOLEAN DEFAULT false,
  at_risk BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_renewal ON members(renewal_date);
CREATE INDEX idx_members_qr ON members(qr_code);

-- Staff notes per member
CREATE TABLE member_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff_profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments & billing
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'failed')),
  method TEXT CHECK (method IN ('manual', 'stripe', 'cash', 'card')),
  stripe_payment_id TEXT,
  invoice_number TEXT UNIQUE,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_member ON payments(member_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Attendance tracking
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  checked_in_by UUID REFERENCES staff_profiles(id),
  method TEXT NOT NULL CHECK (method IN ('manual', 'qr')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attendance_member ON attendance(member_id);
CREATE INDEX idx_attendance_date ON attendance(checked_in_at);

-- Activity log for staff actions
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff_profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);

-- Email logs (Zapier / automated reminders)
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('renewal_reminder', 'payment_failure', 'welcome', 'retention')),
  subject TEXT,
  body TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  zapier_webhook_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI insights cache
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('at_risk', 'retention_email', 'engagement_summary', 'promotion_suggestion')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update members.updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read all staff profiles" ON staff_profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can read own profile" ON staff_profiles
  FOR ALL TO authenticated USING (auth.uid() = id);

CREATE POLICY "Authenticated staff full access to plans" ON membership_plans
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM staff_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Authenticated staff full access to members" ON members
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM staff_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Authenticated staff full access to notes" ON member_notes
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM staff_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Authenticated staff full access to payments" ON payments
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM staff_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Authenticated staff full access to attendance" ON attendance
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM staff_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Authenticated staff read activity log" ON activity_log
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM staff_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Authenticated staff insert activity log" ON activity_log
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM staff_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Authenticated staff full access to email logs" ON email_logs
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM staff_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Authenticated staff full access to ai insights" ON ai_insights
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM staff_profiles WHERE id = auth.uid())
  );

-- Seed default plans
INSERT INTO membership_plans (name, billing_interval, price_cents, description) VALUES
  ('Iron Basic', 'monthly', 4900, 'Full gym access, monthly billing'),
  ('Iron Pro', 'quarterly', 12900, 'Full gym access + classes, billed quarterly'),
  ('Iron Elite', 'annual', 44900, 'Premium access, personal training session monthly');
