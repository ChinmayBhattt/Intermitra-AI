import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { ActivityLogEntry } from "@/lib/types/database";

export default async function ActivityPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("activity_log")
    .select("*, staff_profiles(full_name, role)")
    .order("created_at", { ascending: false })
    .limit(100);

  const entries = (logs ?? []) as (ActivityLogEntry & {
    staff_profiles: { full_name: string; role: string } | null;
  })[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Activity Log</h1>
        <p className="text-zinc-400">Track all staff actions</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-800">
            {entries.map((log) => (
              <div key={log.id} className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="text-sm text-zinc-100">
                    <span className="font-medium">
                      {log.staff_profiles?.full_name ?? "System"}
                    </span>
                    {" "}{log.action}{" "}
                    <span className="text-zinc-400">{log.entity_type}</span>
                    {log.entity_id && (
                      <span className="font-mono text-xs text-zinc-500"> {log.entity_id.slice(0, 8)}</span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500">{formatDateTime(log.created_at)}</p>
                </div>
              </div>
            ))}
            {!entries.length && <p className="p-8 text-center text-zinc-500">No activity yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
