import { createServiceClient } from "@/lib/supabase/server";

interface SendEmailParams {
  memberId: string;
  type: "renewal_reminder" | "payment_failure" | "welcome" | "retention";
  subject: string;
  body: string;
  memberEmail: string;
  memberName: string;
}

export async function queueEmail(params: SendEmailParams) {
  const supabase = await createServiceClient();
  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;

  const { data: emailLog } = await supabase
    .from("email_logs")
    .insert({
      member_id: params.memberId,
      type: params.type,
      subject: params.subject,
      body: params.body,
      status: "pending",
      zapier_webhook_url: webhookUrl ?? null,
    })
    .select()
    .single();

  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: params.type,
          to: params.memberEmail,
          subject: params.subject,
          body: params.body,
          member_name: params.memberName,
          member_id: params.memberId,
        }),
      });

      await supabase
        .from("email_logs")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", emailLog!.id);
    } catch {
      await supabase
        .from("email_logs")
        .update({ status: "failed" })
        .eq("id", emailLog!.id);
    }
  } else {
    await supabase
      .from("email_logs")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", emailLog!.id);
  }

  return emailLog;
}

export async function sendWelcomeEmail(
  memberId: string,
  email: string,
  name: string,
  planName: string
) {
  return queueEmail({
    memberId,
    type: "welcome",
    memberEmail: email,
    memberName: name,
    subject: `Welcome to DMVIron, ${name.split(" ")[0]}!`,
    body: `Hi ${name},\n\nWelcome to DMVIron Gym! Your ${planName} membership is now active. We're excited to help you crush your fitness goals.\n\nSee you at the gym!\n— The DMVIron Team`,
  });
}

export async function sendRenewalReminder(
  memberId: string,
  email: string,
  name: string,
  renewalDate: string
) {
  return queueEmail({
    memberId,
    type: "renewal_reminder",
    memberEmail: email,
    memberName: name,
    subject: "Your DMVIron membership renews in 7 days",
    body: `Hi ${name},\n\nThis is a friendly reminder that your DMVIron membership renews on ${renewalDate}. Please ensure your payment method is up to date.\n\nQuestions? Reply to this email or visit the front desk.\n\n— The DMVIron Team`,
  });
}

export async function sendPaymentFailureEmail(
  memberId: string,
  email: string,
  name: string,
  amount: string
) {
  return queueEmail({
    memberId,
    type: "payment_failure",
    memberEmail: email,
    memberName: name,
    subject: "Action required: Payment failed — DMVIron",
    body: `Hi ${name},\n\nWe were unable to process your payment of ${amount}. Please update your payment method to keep your membership active.\n\nVisit the front desk or contact us to resolve this.\n\n— The DMVIron Team`,
  });
}
