"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, getMemberName } from "@/lib/utils";
import type { Attendance } from "@/lib/types/database";

export function AttendanceClient({
  recentCheckIns,
  weeklyTraffic,
  todayCount,
  weekCount,
}: {
  recentCheckIns: (Attendance & { members: { first_name: string; last_name: string } | null })[];
  weeklyTraffic: { day: string; visits: number }[];
  todayCount: number;
  weekCount: number;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Attendance</h1>
        <p className="text-zinc-400">Track gym traffic and member visits</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm text-zinc-400">Today</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-zinc-100">{todayCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-zinc-400">This Week</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-zinc-100">{weekCount}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Weekly Traffic</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyTraffic}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="day" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }} />
              <Bar dataKey="visits" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Check-ins</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-800">
            {recentCheckIns.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-zinc-100">
                    {a.members ? getMemberName(a.members) : "Unknown"}
                  </p>
                  <p className="text-sm text-zinc-500">{formatDateTime(a.checked_in_at)}</p>
                </div>
                <Badge>{a.method}</Badge>
              </div>
            ))}
            {!recentCheckIns.length && <p className="p-8 text-center text-zinc-500">No check-ins yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
