// ============================================================
// DMVIron Gym SaaS — Core Types
// ============================================================

// ---- Auth & Staff ----
export type UserRole = 'admin' | 'staff';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// ---- Members ----
export type MemberStatus = 'active' | 'expired' | 'paused' | 'cancelled';

export interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo_url?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  status: MemberStatus;
  join_date: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
  // Joined fields
  current_plan?: MembershipPlan;
  subscription?: MemberSubscription;
}

// ---- Membership Plans ----
export type PlanInterval = 'monthly' | 'quarterly' | 'annual';

export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  interval: PlanInterval;
  price: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---- Subscriptions ----
export type SubscriptionStatus = 'active' | 'expired' | 'paused' | 'cancelled';

export interface MemberSubscription {
  id: string;
  member_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string;
  renewal_date: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  plan?: MembershipPlan;
}

// ---- Payments ----
export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'failed' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'stripe' | 'other';

export interface Payment {
  id: string;
  member_id: string;
  subscription_id?: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  transaction_id?: string;
  notes?: string;
  payment_date: string;
  due_date?: string;
  created_at: string;
  // Joined
  member?: Member;
}

// ---- Invoices ----
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  invoice_number: string;
  member_id: string;
  subscription_id?: string;
  amount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  due_date: string;
  paid_date?: string;
  items: InvoiceItem[];
  created_at: string;
  // Joined
  member?: Member;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// ---- Attendance ----
export interface AttendanceRecord {
  id: string;
  member_id: string;
  check_in_time: string;
  check_out_time?: string;
  method: 'manual' | 'qr_code';
  created_at: string;
  // Joined
  member?: Member;
}

// ---- Member Notes ----
export interface MemberNote {
  id: string;
  member_id: string;
  staff_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  // Joined
  staff?: Profile;
}

// ---- Activity Log ----
export type ActivityAction =
  | 'member_created'
  | 'member_updated'
  | 'member_archived'
  | 'member_checked_in'
  | 'payment_logged'
  | 'payment_failed'
  | 'invoice_generated'
  | 'plan_created'
  | 'plan_updated'
  | 'subscription_created'
  | 'subscription_changed'
  | 'staff_created'
  | 'staff_updated'
  | 'note_added'
  | 'settings_updated';

export interface ActivityLogEntry {
  id: string;
  staff_id: string;
  action: ActivityAction;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  created_at: string;
  // Joined
  staff?: Profile;
}

// ---- AI Insights ----
export interface AIInsight {
  id: string;
  type: 'at_risk' | 'retention_email' | 'engagement_report' | 'promotion';
  member_id?: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
  expires_at?: string;
  // Joined
  member?: Member;
}

// ---- Dashboard Stats ----
export interface DashboardStats {
  total_active_members: number;
  new_members_this_month: number;
  churn_rate: number;
  monthly_revenue: number;
  attendance_today: number;
  overdue_payments: number;
}

export interface MembershipGrowthData {
  month: string;
  active: number;
  new_members: number;
  churned: number;
}

export interface AttendanceTrafficData {
  day: string;
  check_ins: number;
}

export interface HourlyTrafficData {
  hour: string;
  count: number;
}
