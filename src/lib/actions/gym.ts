"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/auth";
import { computeRenewalDate, generateInvoiceNumber } from "@/lib/utils";
import { sendWelcomeEmail } from "@/lib/email";
import type { BillingInterval, Member, MemberStatus } from "@/lib/types/database";

export async function createMember(formData: FormData): Promise<Member> {
  const supabase = await createClient();

  const planId = formData.get("plan_id") as string;
  const joinDate = (formData.get("join_date") as string) || new Date().toISOString().split("T")[0];

  const { data: plan } = await supabase
    .from("membership_plans")
    .select("*")
    .eq("id", planId)
    .single();

  const renewalDate = plan
    ? computeRenewalDate(new Date(joinDate), plan.billing_interval as BillingInterval)
        .toISOString()
        .split("T")[0]
    : null;

  const { data, error } = await supabase
    .from("members")
    .insert({
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || null,
      photo_url: (formData.get("photo_url") as string) || null,
      plan_id: planId || null,
      status: (formData.get("status") as MemberStatus) || "active",
      join_date: joinDate,
      renewal_date: renewalDate,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (plan && data) {
    await supabase.from("payments").insert({
      member_id: data.id,
      amount_cents: plan.price_cents,
      status: "pending",
      method: "manual",
      invoice_number: generateInvoiceNumber(),
      due_date: renewalDate,
    });

    await sendWelcomeEmail(
      data.id,
      data.email,
      `${data.first_name} ${data.last_name}`,
      plan.name
    );
  }

  await logActivity("created", "member", data!.id, { name: `${data!.first_name} ${data!.last_name}` });
  revalidatePath("/members");
  revalidatePath("/dashboard");
  return data as Member;
}

export async function updateMember(id: string, formData: FormData) {
  const supabase = await createClient();

  const planId = formData.get("plan_id") as string;
  const { data: plan } = planId
    ? await supabase.from("membership_plans").select("*").eq("id", planId).single()
    : { data: null };

  const joinDate = formData.get("join_date") as string;
  const renewalDate =
    plan && joinDate
      ? computeRenewalDate(new Date(joinDate), plan.billing_interval as BillingInterval)
          .toISOString()
          .split("T")[0]
      : (formData.get("renewal_date") as string) || null;

  const { error } = await supabase
    .from("members")
    .update({
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || null,
      photo_url: (formData.get("photo_url") as string) || null,
      plan_id: planId || null,
      status: formData.get("status") as MemberStatus,
      join_date: joinDate,
      renewal_date: renewalDate,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  await logActivity("updated", "member", id);
  revalidatePath(`/members/${id}`);
  revalidatePath("/members");
}

export async function archiveMember(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("members").update({ archived: true }).eq("id", id);
  if (error) throw new Error(error.message);
  await logActivity("archived", "member", id);
  revalidatePath("/members");
}

export async function addMemberNote(memberId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("member_notes").insert({
    member_id: memberId,
    staff_id: user.id,
    content,
  });

  if (error) throw new Error(error.message);
  await logActivity("added_note", "member", memberId);
  revalidatePath(`/members/${memberId}`);
}

export async function switchMemberPlan(memberId: string, planId: string) {
  const supabase = await createClient();
  const { data: plan } = await supabase
    .from("membership_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (!plan) throw new Error("Plan not found");

  const renewalDate = computeRenewalDate(new Date(), plan.billing_interval as BillingInterval)
    .toISOString()
    .split("T")[0];

  const { error } = await supabase
    .from("members")
    .update({ plan_id: planId, renewal_date: renewalDate, status: "active" })
    .eq("id", memberId);

  if (error) throw new Error(error.message);
  await logActivity("switched_plan", "member", memberId, { plan: plan.name });
  revalidatePath(`/members/${memberId}`);
}

export async function createPlan(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("membership_plans").insert({
    name: formData.get("name") as string,
    billing_interval: formData.get("billing_interval") as BillingInterval,
    price_cents: Math.round(parseFloat(formData.get("price") as string) * 100),
    description: (formData.get("description") as string) || null,
  });

  if (error) throw new Error(error.message);
  await logActivity("created", "plan");
  revalidatePath("/plans");
}

export async function updatePlan(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("membership_plans")
    .update({
      name: formData.get("name") as string,
      billing_interval: formData.get("billing_interval") as BillingInterval,
      price_cents: Math.round(parseFloat(formData.get("price") as string) * 100),
      description: (formData.get("description") as string) || null,
      active: formData.get("active") === "true",
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  await logActivity("updated", "plan", id);
  revalidatePath("/plans");
}

export async function logPayment(formData: FormData) {
  const supabase = await createClient();
  const status = formData.get("status") as string;
  const paidAt = status === "paid" ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("payments")
    .insert({
      member_id: formData.get("member_id") as string,
      amount_cents: Math.round(parseFloat(formData.get("amount") as string) * 100),
      status: status as "paid" | "pending" | "overdue" | "failed",
      method: (formData.get("method") as "manual" | "stripe" | "cash" | "card") || "manual",
      invoice_number: generateInvoiceNumber(),
      due_date: (formData.get("due_date") as string) || null,
      paid_at: paidAt,
      notes: (formData.get("notes") as string) || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  await logActivity("logged_payment", "payment", data!.id);
  revalidatePath("/payments");
  revalidatePath(`/members/${formData.get("member_id")}`);
}

export async function checkInMember(memberId: string, method: "manual" | "qr" = "manual") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("attendance").insert({
    member_id: memberId,
    checked_in_by: user?.id ?? null,
    method,
  });

  if (error) throw new Error(error.message);
  await logActivity("checked_in", "member", memberId, { method });
  revalidatePath("/attendance");
  revalidatePath(`/members/${memberId}`);
}

export async function checkInByQrCode(qrCode: string): Promise<Member> {
  const supabase = await createClient();
  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("qr_code", qrCode)
    .eq("archived", false)
    .single();

  if (!member) throw new Error("Member not found");
  if (member.status !== "active") throw new Error(`Membership is ${member.status}`);

  const { error } = await supabase.from("attendance").insert({
    member_id: member.id,
    method: "qr",
  });

  if (error) throw new Error(error.message);
  return member as Member;
}

export async function simulateStripePayment(paymentId: string, success: boolean) {
  const supabase = await createClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("*, members(first_name, last_name, email)")
    .eq("id", paymentId)
    .single();

  if (!payment) throw new Error("Payment not found");

  const stripeId = `pi_sim_${Math.random().toString(36).substring(2, 14)}`;

  if (success) {
    await supabase
      .from("payments")
      .update({
        status: "paid",
        method: "stripe",
        stripe_payment_id: stripeId,
        paid_at: new Date().toISOString(),
      })
      .eq("id", paymentId);
  } else {
    await supabase
      .from("payments")
      .update({ status: "failed", method: "stripe", stripe_payment_id: stripeId })
      .eq("id", paymentId);

    const member = payment.members as { first_name: string; last_name: string; email: string } | null;
    if (member) {
      const { sendPaymentFailureEmail } = await import("@/lib/email");
      await sendPaymentFailureEmail(
        payment.member_id,
        member.email,
        `${member.first_name} ${member.last_name}`,
        `$${(payment.amount_cents / 100).toFixed(2)}`
      );
    }
  }

  await logActivity("stripe_simulated", "payment", paymentId, { success });
  revalidatePath("/payments");
}

export async function updateStaffRole(staffId: string, role: "admin" | "staff") {
  const supabase = await createClient();
  const currentStaff = await import("@/lib/auth").then((m) => m.getCurrentStaff());
  if (currentStaff?.role !== "admin") throw new Error("Admin only");

  const { error } = await supabase.from("staff_profiles").update({ role }).eq("id", staffId);
  if (error) throw new Error(error.message);
  await logActivity("updated_role", "staff", staffId, { role });
  revalidatePath("/settings");
}

export async function markOverduePayments() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  await supabase
    .from("payments")
    .update({ status: "overdue" })
    .eq("status", "pending")
    .lt("due_date", today);

  revalidatePath("/payments");
}
