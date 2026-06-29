"use client";

import { cn } from "@/lib/utils";

interface MonthPillsProps {
  months: string[];
  active: string;
  onChange: (month: string) => void;
}

export default function MonthPills({ months, active, onChange }: MonthPillsProps) {
  return (
    <div className="month-pills">
      {months.map((month) => (
        <button
          key={month}
          type="button"
          className={cn("month-pill", active === month && "month-pill--active")}
          onClick={() => onChange(month)}
        >
          {month}
        </button>
      ))}
    </div>
  );
}
