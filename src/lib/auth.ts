import { createClient } from "@/lib/supabase/server";

export async function logActivity(
  action: string,
  entityType: string,
  entityId?: string,
  metadata: Record<string, unknown> = {}
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("activity_log").insert({
    staff_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    metadata,
  });
}

export async function getCurrentStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("staff_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export function isAdmin(role: string | undefined): boolean {
  return role === "admin";
}
