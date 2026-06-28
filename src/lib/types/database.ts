export type StaffRole = "admin" | "staff";
export type MemberStatus = "active" | "expired" | "paused" | "cancelled";
export type BillingInterval = "monthly" | "quarterly" | "annual";
export type PaymentStatus = "paid" | "pending" | "overdue" | "failed";
export type PaymentMethod = "manual" | "stripe" | "cash" | "card";
export type CheckInMethod = "manual" | "qr";
export type EmailType = "renewal_reminder" | "payment_failure" | "welcome" | "retention";
export type InsightType = "at_risk" | "retention_email" | "engagement_summary" | "promotion_suggestion";

export interface StaffProfile {
  id: string;
  full_name: string;
  email: string;
  role: StaffRole;
  created_at: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  billing_interval: BillingInterval;
  price_cents: number;
  description: string | null;
  active: boolean;
  created_at: string;
}

export interface Member {
  id: string;
  qr_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  photo_url: string | null;
  plan_id: string | null;
  status: MemberStatus;
  join_date: string;
  renewal_date: string | null;
  archived: boolean;
  at_risk: boolean;
  created_at: string;
  updated_at: string;
  membership_plans?: MembershipPlan | null;
}

export interface MemberNote {
  id: string;
  member_id: string;
  staff_id: string;
  content: string;
  created_at: string;
  staff_profiles?: StaffProfile;
}

export interface Payment {
  id: string;
  member_id: string;
  amount_cents: number;
  status: PaymentStatus;
  method: PaymentMethod | null;
  stripe_payment_id: string | null;
  invoice_number: string | null;
  due_date: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  members?: Pick<Member, "first_name" | "last_name" | "email">;
}

export interface Attendance {
  id: string;
  member_id: string;
  checked_in_at: string;
  checked_in_by: string | null;
  method: CheckInMethod;
  created_at: string;
  members?: Pick<Member, "first_name" | "last_name">;
}

export interface ActivityLogEntry {
  id: string;
  staff_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  staff_profiles?: StaffProfile;
}

export interface EmailLog {
  id: string;
  member_id: string | null;
  type: EmailType;
  subject: string | null;
  body: string | null;
  status: "pending" | "sent" | "failed";
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface AiInsight {
  id: string;
  member_id: string | null;
  type: InsightType;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}
