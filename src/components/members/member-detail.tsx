"use client";

import { useState } from "react";
import { addMemberNote, checkInMember, archiveMember, switchMemberPlan } from "@/lib/actions/gym";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatDateTime, getMemberName } from "@/lib/utils";
import type { Member, MemberNote, Payment, Attendance, MembershipPlan } from "@/lib/types/database";
import QRCode from "qrcode";
import { useEffect } from "react";

export function MemberDetailClient({
  member,
  notes,
  payments,
  attendance,
  plans,
}: {
  member: Member;
  notes: MemberNote[];
  payments: Payment[];
  attendance: Attendance[];
  plans: MembershipPlan[];
}) {
  const [note, setNote] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(`${window.location.origin}/check-in/${member.qr_code}`, {
      width: 200,
      margin: 2,
      color: { dark: "#ef4444", light: "#18181b" },
    }).then(setQrDataUrl);
  }, [member.qr_code]);

  async function handleAddNote() {
    if (!note.trim()) return;
    setLoading(true);
    await addMemberNote(member.id, note);
    setNote("");
    setLoading(false);
    window.location.reload();
  }

  async function handleCheckIn() {
    setLoading(true);
    await checkInMember(member.id);
    setLoading(false);
    window.location.reload();
  }

  async function handleArchive() {
    if (!confirm("Archive this member?")) return;
    await archiveMember(member.id);
    window.location.href = "/members";
  }

  async function handleSwitchPlan(planId: string) {
    await switchMemberPlan(member.id, planId);
    window.location.reload();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">{getMemberName(member)}</h2>
              <p className="text-zinc-400">{member.email}</p>
              {member.phone && <p className="text-zinc-500">{member.phone}</p>}
            </div>
            <div className="flex gap-2">
              {member.at_risk && <Badge status="overdue">At Risk</Badge>}
              <Badge status={member.status}>{member.status}</Badge>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-zinc-500">Joined</span><p className="text-zinc-200">{formatDate(member.join_date)}</p></div>
            <div><span className="text-zinc-500">Renewal</span><p className="text-zinc-200">{formatDate(member.renewal_date)}</p></div>
            <div><span className="text-zinc-500">Plan</span><p className="text-zinc-200">{member.membership_plans?.name ?? "None"}</p></div>
            <div><span className="text-zinc-500">QR Code</span><p className="font-mono text-zinc-200 text-xs">{member.qr_code}</p></div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleCheckIn} disabled={loading} size="sm">Check In</Button>
            <Button onClick={handleArchive} variant="outline" size="sm">Archive</Button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 font-semibold text-zinc-100">Switch Plan</h3>
          <div className="flex flex-wrap gap-2">
            {plans.map((plan) => (
              <Button
                key={plan.id}
                variant={member.plan_id === plan.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleSwitchPlan(plan.id)}
              >
                {plan.name} — {formatCurrency(plan.price_cents)}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 font-semibold text-zinc-100">Staff Notes</h3>
          <div className="space-y-3 mb-4">
            {notes.map((n) => (
              <div key={n.id} className="rounded-lg bg-zinc-800/50 p-3">
                <p className="text-sm text-zinc-200">{n.content}</p>
                <p className="mt-1 text-xs text-zinc-500">{formatDateTime(n.created_at)}</p>
              </div>
            ))}
            {!notes.length && <p className="text-sm text-zinc-500">No notes yet</p>}
          </div>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note..." />
          <Button onClick={handleAddNote} disabled={loading} className="mt-2" size="sm">Add Note</Button>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 font-semibold text-zinc-100">Payment History</h3>
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-3">
                <div>
                  <p className="text-sm font-medium text-zinc-200">{formatCurrency(p.amount_cents)}</p>
                  <p className="text-xs text-zinc-500">{p.invoice_number} · {p.method ?? "—"}</p>
                </div>
                <Badge status={p.status}>{p.status}</Badge>
              </div>
            ))}
            {!payments.length && <p className="text-sm text-zinc-500">No payments</p>}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {qrDataUrl && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
            <h3 className="mb-4 font-semibold text-zinc-100">Member QR Code</h3>
            <img src={qrDataUrl} alt="QR Code" className="mx-auto rounded-lg" />
            <p className="mt-2 text-xs text-zinc-500">Scan at check-in kiosk</p>
          </div>
        )}

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 font-semibold text-zinc-100">Recent Attendance</h3>
          <div className="space-y-2">
            {attendance.slice(0, 10).map((a) => (
              <div key={a.id} className="flex justify-between text-sm">
                <span className="text-zinc-400">{formatDateTime(a.checked_in_at)}</span>
                <Badge>{a.method}</Badge>
              </div>
            ))}
            {!attendance.length && <p className="text-sm text-zinc-500">No check-ins yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
