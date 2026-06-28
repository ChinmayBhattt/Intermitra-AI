-- ============================================================
-- DMVIron Gym SaaS — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. MEMBERSHIP PLANS
-- ============================================================
CREATE TABLE public.membership_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  interval TEXT NOT NULL CHECK (interval IN ('monthly', 'quarterly', 'annual')),
  price DECIMAL(10,2) NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. MEMBERS
-- ============================================================
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  date_of_birth DATE,
  emergency_contact TEXT,
  emergency_phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'paused', 'cancelled')),
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_members_status ON public.members(status);
CREATE INDEX idx_members_email ON public.members(email);
CREATE INDEX idx_members_archived ON public.members(archived);

-- ============================================================
-- 4. MEMBER SUBSCRIPTIONS
-- ============================================================
CREATE TABLE public.member_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.membership_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'paused', 'cancelled')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  renewal_date DATE NOT NULL,
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_member ON public.member_subscriptions(member_id);
CREATE INDEX idx_subscriptions_status ON public.member_subscriptions(status);
CREATE INDEX idx_subscriptions_renewal ON public.member_subscriptions(renewal_date);

-- ============================================================
-- 5. PAYMENTS
-- ============================================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.member_subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'failed', 'refunded')),
  method TEXT NOT NULL DEFAULT 'cash' CHECK (method IN ('cash', 'card', 'bank_transfer', 'stripe', 'other')),
  transaction_id TEXT,
  notes TEXT,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_member ON public.payments(member_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_date ON public.payments(payment_date);

-- ============================================================
-- 6. INVOICES
-- ============================================================
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.member_subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE NOT NULL,
  paid_date DATE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_member ON public.invoices(member_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);

-- Sequence for invoice numbers
CREATE SEQUENCE invoice_number_seq START 1001;

-- ============================================================
-- 7. ATTENDANCE
-- ============================================================
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  method TEXT NOT NULL DEFAULT 'manual' CHECK (method IN ('manual', 'qr_code')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attendance_member ON public.attendance(member_id);
CREATE INDEX idx_attendance_checkin ON public.attendance(check_in_time);

-- ============================================================
-- 8. MEMBER NOTES
-- ============================================================
CREATE TABLE public.member_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_member ON public.member_notes(member_id);

-- ============================================================
-- 9. ACTIVITY LOG
-- ============================================================
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_staff ON public.activity_log(staff_id);
CREATE INDEX idx_activity_created ON public.activity_log(created_at DESC);

-- ============================================================
-- 10. AI INSIGHTS
-- ============================================================
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('at_risk', 'retention_email', 'engagement_report', 'promotion')),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_insights_type ON public.ai_insights(type);
CREATE INDEX idx_insights_member ON public.ai_insights(member_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Helper: check if user is authenticated staff/admin
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: users can read all, update own
CREATE POLICY "Staff can view all profiles" ON public.profiles FOR SELECT USING (is_staff());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL USING (is_admin());

-- Members: staff can read, admin can write
CREATE POLICY "Staff can view members" ON public.members FOR SELECT USING (is_staff());
CREATE POLICY "Staff can insert members" ON public.members FOR INSERT WITH CHECK (is_staff());
CREATE POLICY "Staff can update members" ON public.members FOR UPDATE USING (is_staff());
CREATE POLICY "Admins can delete members" ON public.members FOR DELETE USING (is_admin());

-- Plans: everyone authenticated can read, admin can write
CREATE POLICY "Staff can view plans" ON public.membership_plans FOR SELECT USING (is_staff());
CREATE POLICY "Admins can manage plans" ON public.membership_plans FOR ALL USING (is_admin());

-- Subscriptions: staff can read/write
CREATE POLICY "Staff can view subscriptions" ON public.member_subscriptions FOR SELECT USING (is_staff());
CREATE POLICY "Staff can manage subscriptions" ON public.member_subscriptions FOR ALL USING (is_staff());

-- Payments: staff can read/write
CREATE POLICY "Staff can view payments" ON public.payments FOR SELECT USING (is_staff());
CREATE POLICY "Staff can manage payments" ON public.payments FOR ALL USING (is_staff());

-- Invoices: staff can read/write
CREATE POLICY "Staff can view invoices" ON public.invoices FOR SELECT USING (is_staff());
CREATE POLICY "Staff can manage invoices" ON public.invoices FOR ALL USING (is_staff());

-- Attendance: staff can read/write
CREATE POLICY "Staff can view attendance" ON public.attendance FOR SELECT USING (is_staff());
CREATE POLICY "Staff can manage attendance" ON public.attendance FOR ALL USING (is_staff());

-- Notes: staff can read/write
CREATE POLICY "Staff can view notes" ON public.member_notes FOR SELECT USING (is_staff());
CREATE POLICY "Staff can manage notes" ON public.member_notes FOR ALL USING (is_staff());

-- Activity log: staff can read, system writes
CREATE POLICY "Staff can view activity log" ON public.activity_log FOR SELECT USING (is_staff());
CREATE POLICY "Staff can insert activity log" ON public.activity_log FOR INSERT WITH CHECK (is_staff());

-- AI Insights: staff can read, system writes
CREATE POLICY "Staff can view insights" ON public.ai_insights FOR SELECT USING (is_staff());
CREATE POLICY "Staff can manage insights" ON public.ai_insights FOR ALL USING (is_staff());

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.membership_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.member_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.member_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- SEED DATA: Default plans
-- ============================================================
INSERT INTO public.membership_plans (name, description, interval, price, features) VALUES
  ('Basic Monthly', 'Access to gym floor and cardio equipment', 'monthly', 29.99, '["Gym floor access", "Cardio equipment", "Locker room"]'::jsonb),
  ('Premium Monthly', 'Full access including classes and sauna', 'monthly', 49.99, '["Full gym access", "Group classes", "Sauna & steam", "Locker room", "1 PT session/month"]'::jsonb),
  ('Basic Quarterly', 'Save 10% with quarterly billing', 'quarterly', 80.99, '["Gym floor access", "Cardio equipment", "Locker room", "10% savings"]'::jsonb),
  ('Premium Quarterly', 'Full access, quarterly savings', 'quarterly', 134.99, '["Full gym access", "Group classes", "Sauna & steam", "Locker room", "3 PT sessions/quarter", "15% savings"]'::jsonb),
  ('Annual Elite', 'Best value — everything included', 'annual', 449.99, '["Full gym access", "Unlimited classes", "Sauna & steam", "Priority locker", "12 PT sessions/year", "Guest passes", "25% savings"]'::jsonb);
