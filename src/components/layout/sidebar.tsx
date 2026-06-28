"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarCheck,
  QrCode,
  Sparkles,
  ClipboardList,
  Settings,
  LogOut,
  Dumbbell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { StaffProfile } from "@/lib/types/database";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "Members", icon: Users },
  { href: "/plans", label: "Plans", icon: Dumbbell },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/check-in", label: "QR Check-In", icon: QrCode },
  { href: "/ai", label: "AI Insights", icon: Sparkles },
  { href: "/activity", label: "Activity Log", icon: ClipboardList },
  { href: "/settings", label: "Settings", icon: Settings, adminOnly: true },
];

export function Sidebar({ staff }: { staff: StaffProfile | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-3 border-b border-zinc-800 px-6 py-5">
        <Image src="/assets/logo.svg" alt="DMVIron" width={36} height={36} />
        <div>
          <p className="font-bold text-zinc-100 tracking-tight">DMVIron</p>
          <p className="text-xs text-zinc-500">Gym Management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          if (item.adminOnly && staff?.role !== "admin") return null;
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-red-600/15 text-red-400"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium text-zinc-200">{staff?.full_name ?? "Staff"}</p>
          <p className="text-xs capitalize text-zinc-500">{staff?.role ?? "staff"}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
