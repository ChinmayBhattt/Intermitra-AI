export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      staff_profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: "admin" | "staff";
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role?: "admin" | "staff";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["staff_profiles"]["Insert"]>;
      };
      membership_plans: {
        Row: {
          id: string;
          name: string;
          billing_interval: "monthly" | "quarterly" | "annual";
          price_cents: number;
          description: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          billing_interval: "monthly" | "quarterly" | "annual";
          price_cents: number;
          description?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["membership_plans"]["Insert"]>;
      };
      members: {
        Row: {
          id: string;
          qr_code: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          photo_url: string | null;
          plan_id: string | null;
          status: "active" | "expired" | "paused" | "cancelled";
          join_date: string;
          renewal_date: string | null;
          archived: boolean;
          at_risk: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          qr_code?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          photo_url?: string | null;
          plan_id?: string | null;
          status?: "active" | "expired" | "paused" | "cancelled";
          join_date?: string;
          renewal_date?: string | null;
          archived?: boolean;
          at_risk?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["members"]["Insert"]>;
      };
      member_notes: {
        Row: {
          id: string;
          member_id: string;
          staff_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          staff_id: string;
          content: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["member_notes"]["Insert"]>;
      };
      payments: {
        Row: {
          id: string;
          member_id: string;
          amount_cents: number;
          status: "paid" | "pending" | "overdue" | "failed";
          method: "manual" | "stripe" | "cash" | "card" | null;
          stripe_payment_id: string | null;
          invoice_number: string | null;
          due_date: string | null;
          paid_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          amount_cents: number;
          status?: "paid" | "pending" | "overdue" | "failed";
          method?: "manual" | "stripe" | "cash" | "card" | null;
          stripe_payment_id?: string | null;
          invoice_number?: string | null;
          due_date?: string | null;
          paid_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      attendance: {
        Row: {
          id: string;
          member_id: string;
          checked_in_at: string;
          checked_in_by: string | null;
          method: "manual" | "qr";
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          checked_in_at?: string;
          checked_in_by?: string | null;
          method: "manual" | "qr";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["attendance"]["Insert"]>;
      };
      activity_log: {
        Row: {
          id: string;
          staff_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          staff_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_log"]["Insert"]>;
      };
      email_logs: {
        Row: {
          id: string;
          member_id: string | null;
          type: "renewal_reminder" | "payment_failure" | "welcome" | "retention";
          subject: string | null;
          body: string | null;
          status: "pending" | "sent" | "failed";
          scheduled_for: string | null;
          sent_at: string | null;
          zapier_webhook_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id?: string | null;
          type: "renewal_reminder" | "payment_failure" | "welcome" | "retention";
          subject?: string | null;
          body?: string | null;
          status?: "pending" | "sent" | "failed";
          scheduled_for?: string | null;
          sent_at?: string | null;
          zapier_webhook_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["email_logs"]["Insert"]>;
      };
      ai_insights: {
        Row: {
          id: string;
          member_id: string | null;
          type: "at_risk" | "retention_email" | "engagement_summary" | "promotion_suggestion";
          content: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id?: string | null;
          type: "at_risk" | "retention_email" | "engagement_summary" | "promotion_suggestion";
          content: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_insights"]["Insert"]>;
      };
    };
  };
}
