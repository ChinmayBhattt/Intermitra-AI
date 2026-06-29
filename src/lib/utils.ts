import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, addMonths, addYears } from "date-fns";
import type { BillingInterval } from "./types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: string | Date | null, fmt: string = "MMM d, yyyy"): string {
  if (!date) return "—";
  return format(new Date(date), fmt);
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "MMM d, yyyy h:mm a");
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getMemberName(member: { first_name: string; last_name: string }): string {
  return `${member.first_name} ${member.last_name}`;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export function computeRenewalDate(joinDate: Date, interval: BillingInterval): Date {
  switch (interval) {
    case "monthly":
      return addMonths(joinDate, 1);
    case "quarterly":
      return addMonths(joinDate, 3);
    case "annual":
      return addYears(joinDate, 1);
  }
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const prefix = format(now, "yyyyMM");
  const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${prefix}-${suffix}`;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    expired: "bg-red-500/15 text-red-400 border-red-500/30",
    paused: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    cancelled: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
    paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    overdue: "bg-red-500/15 text-red-400 border-red-500/30",
    failed: "bg-red-500/15 text-red-400 border-red-500/30",
    sent: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  };
  return map[status] ?? "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";
}

export function timeAgo(date: string | Date): string {
  return formatRelative(date);
}

export function getFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}


