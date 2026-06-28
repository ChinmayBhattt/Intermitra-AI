"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface DashboardChartsProps {
  growthData: { month: string; members: number }[];
  trafficData: { day: string; visits: number }[];
}

export function DashboardCharts({ growthData, trafficData }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-sm font-medium text-zinc-300">Membership Growth</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
            <YAxis stroke="#71717a" fontSize={12} />
            <Tooltip
              contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
            />
            <Line type="monotone" dataKey="members" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-sm font-medium text-zinc-300">Weekly Traffic</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={trafficData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="day" stroke="#71717a" fontSize={12} />
            <YAxis stroke="#71717a" fontSize={12} />
            <Tooltip
              contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
            />
            <Bar dataKey="visits" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
