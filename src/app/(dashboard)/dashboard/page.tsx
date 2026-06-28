import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardCharts } from "@/components/dashboard/charts";
import { Users, TrendingUp, TrendingDown, AlertTriangle, CalendarCheck } from "lucide-react";
import { format, subMonths, subDays, startOfDay } from "date-fns";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { count: activeCount } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .eq("archived", false);

  const { count: atRiskCount } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("at_risk", true);

  const { count: todayCheckIns } = await supabase
    .from("attendance")
    .select("*", { count: "exact", head: true })
    .gte("checked_in_at", startOfDay(new Date()).toISOString());

  const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
  const { count: cancelledRecent } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("status", "cancelled")
    .gte("updated_at", thirtyDaysAgo);

  const churnRate =
    activeCount && activeCount > 0
      ? (((cancelledRecent ?? 0) / activeCount) * 100).toFixed(1)
      : "0.0";

  const growthData = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = format(subMonths(new Date(), i), "yyyy-MM-01");
    const { count } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .lte("join_date", monthStart)
      .eq("archived", false);
    growthData.push({
      month: format(subMonths(new Date(), i), "MMM"),
      members: count ?? 0,
    });
  }

  const trafficData = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 6; i >= 0; i--) {
    const day = subDays(new Date(), i);
    const dayStart = startOfDay(day).toISOString();
    const dayEnd = startOfDay(subDays(day, -1)).toISOString();
    const { count } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .gte("checked_in_at", dayStart)
      .lt("checked_in_at", dayEnd);
    trafficData.push({ day: days[day.getDay()], visits: count ?? 0 });
  }

  const { data: overduePayments } = await supabase
    .from("payments")
    .select("id")
    .in("status", ["overdue", "failed"]);

  const stats = [
    {
      title: "Active Members",
      value: activeCount ?? 0,
      icon: Users,
      color: "text-emerald-400",
    },
    {
      title: "Today's Check-ins",
      value: todayCheckIns ?? 0,
      icon: CalendarCheck,
      color: "text-blue-400",
    },
    {
      title: "At-Risk Members",
      value: atRiskCount ?? 0,
      icon: AlertTriangle,
      color: "text-amber-400",
    },
    {
      title: "Churn Rate (30d)",
      value: `${churnRate}%`,
      icon: parseFloat(churnRate) > 5 ? TrendingDown : TrendingUp,
      color: parseFloat(churnRate) > 5 ? "text-red-400" : "text-emerald-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Dashboard</h1>
        <p className="text-zinc-400">Overview of DMVIron gym operations</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-zinc-100">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DashboardCharts growthData={growthData} trafficData={trafficData} />

      {(overduePayments?.length ?? 0) > 0 && (
        <Card className="border-red-900/50 bg-red-950/20">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <p className="text-sm text-red-300">
              {overduePayments!.length} payment(s) need attention —{" "}
              <a href="/payments" className="underline hover:text-red-200">
                View payments
              </a>
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <a href="/members/new" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500">
            Add Member
          </a>
          <a href="/check-in" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
            QR Check-In
          </a>
          <a href="/ai" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
            Run AI Analysis
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
