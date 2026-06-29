"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, QrCode, CreditCard, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/members", label: "Members", icon: Users },
  { href: "/attendance/scanner", label: "Scan", icon: QrCode },
  { href: "/payments", label: "Pay", icon: CreditCard },
  { href: "/settings", label: "More", icon: LayoutGrid },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="mobile-bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn("mobile-nav-item", active && "mobile-nav-item--active")}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
