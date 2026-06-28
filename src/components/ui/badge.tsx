import { cn, statusColor } from "@/lib/utils";

export function Badge({
  className,
  status,
  children,
}: {
  className?: string;
  status?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        status ? statusColor(status) : "bg-zinc-800 text-zinc-300 border-zinc-700",
        className
      )}
    >
      {children}
    </span>
  );
}
