"use client";

import { updateStaffRole } from "@/lib/actions/gym";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StaffProfile } from "@/lib/types/database";

export function SettingsClient({
  staffList,
  currentRole,
}: {
  staffList: StaffProfile[];
  currentRole: string;
}) {
  if (currentRole !== "admin") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-zinc-100">Settings</h1>
        <p className="text-zinc-400">Admin access required to manage staff roles.</p>
      </div>
    );
  }

  async function handleRoleChange(staffId: string, role: "admin" | "staff") {
    await updateStaffRole(staffId, role);
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Settings</h1>
        <p className="text-zinc-400">Manage staff roles and permissions</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Staff & Access</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {staffList.map((staff) => (
            <div key={staff.id} className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-4">
              <div>
                <p className="font-medium text-zinc-100">{staff.full_name}</p>
                <p className="text-sm text-zinc-500">{staff.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{staff.role}</Badge>
                {staff.role === "staff" ? (
                  <Button size="sm" variant="outline" onClick={() => handleRoleChange(staff.id, "admin")}>
                    Promote to Admin
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => handleRoleChange(staff.id, "staff")}>
                    Demote to Staff
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Role Permissions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-800 p-4">
              <h3 className="font-semibold text-red-400">Admin</h3>
              <ul className="mt-2 space-y-1 text-sm text-zinc-400">
                <li>Full member management</li>
                <li>Plan & pricing control</li>
                <li>Staff role management</li>
                <li>All AI features</li>
                <li>Activity log access</li>
              </ul>
            </div>
            <div className="rounded-lg border border-zinc-800 p-4">
              <h3 className="font-semibold text-zinc-300">Staff</h3>
              <ul className="mt-2 space-y-1 text-sm text-zinc-400">
                <li>Member check-in & notes</li>
                <li>View members & attendance</li>
                <li>Log manual payments</li>
                <li>QR code scanning</li>
                <li>View dashboard</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Automated Reminders (Zapier)</CardTitle></CardHeader>
        <CardContent className="text-sm text-zinc-400 space-y-2">
          <p>Configure <code className="text-red-400">ZAPIER_WEBHOOK_URL</code> in your environment to enable:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Renewal reminder emails (7 days before)</li>
            <li>Payment failure notifications</li>
            <li>Welcome emails on signup</li>
          </ul>
          <p className="mt-2">Cron endpoint: <code className="text-red-400">POST /api/cron/reminders</code></p>
        </CardContent>
      </Card>
    </div>
  );
}
