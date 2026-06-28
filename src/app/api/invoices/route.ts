import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateInvoiceNumber } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const memberId = request.nextUrl.searchParams.get("member_id");
  if (!memberId) {
    return NextResponse.json({ error: "member_id required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("members")
    .select("*, membership_plans(name, price_cents)")
    .eq("id", memberId)
    .single();

  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  const plan = member.membership_plans as { name: string; price_cents: number } | null;
  const invoiceNumber = generateInvoiceNumber();

  const invoice = {
    invoice_number: invoiceNumber,
    date: new Date().toISOString().split("T")[0],
    member: {
      name: `${member.first_name} ${member.last_name}`,
      email: member.email,
      phone: member.phone,
    },
    plan: plan?.name ?? "N/A",
    items: (payments ?? []).map((p) => ({
      description: `Membership payment — ${p.invoice_number}`,
      amount: p.amount_cents / 100,
      status: p.status,
      date: p.paid_at ?? p.due_date,
    })),
    total_due: (payments ?? [])
      .filter((p) => p.status !== "paid")
      .reduce((sum, p) => sum + p.amount_cents, 0) / 100,
  };

  return NextResponse.json(invoice);
}
