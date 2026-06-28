"use client";

import { useState } from "react";
import { createPlan, updatePlan } from "@/lib/actions/gym";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { MembershipPlan } from "@/lib/types/database";
import { Plus } from "lucide-react";

export function PlansClient({ plans }: { plans: MembershipPlan[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MembershipPlan | null>(null);

  async function handleCreate(formData: FormData) {
    await createPlan(formData);
    setShowForm(false);
    window.location.reload();
  }

  async function handleUpdate(formData: FormData) {
    if (!editing) return;
    await updatePlan(editing.id, formData);
    setEditing(null);
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Membership Plans</h1>
          <p className="text-zinc-400">Manage plan tiers and pricing</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditing(null); }}>
          <Plus className="h-4 w-4" /> New Plan
        </Button>
      </div>

      {(showForm || editing) && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Edit Plan" : "Create Plan"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={editing ? handleUpdate : handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input name="name" defaultValue={editing?.name} required />
                </div>
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input name="price" type="number" step="0.01" defaultValue={editing ? editing.price_cents / 100 : ""} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Billing Interval</Label>
                <select name="billing_interval" defaultValue={editing?.billing_interval ?? "monthly"} className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100">
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" defaultValue={editing?.description ?? ""} />
              </div>
              {editing && (
                <div className="space-y-2">
                  <Label>Active</Label>
                  <select name="active" defaultValue={editing.active ? "true" : "false"} className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit">{editing ? "Update" : "Create"}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={!plan.active ? "opacity-50" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                <Badge>{plan.billing_interval}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-400">{formatCurrency(plan.price_cents)}</p>
              <p className="mt-2 text-sm text-zinc-400">{plan.description}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => { setEditing(plan); setShowForm(false); }}>
                Edit
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
