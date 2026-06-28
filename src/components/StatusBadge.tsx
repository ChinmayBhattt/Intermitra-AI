import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusMap: Record<string, string> = {
    active: 'badge-active',
    expired: 'badge-expired',
    paused: 'badge-paused',
    cancelled: 'badge-cancelled',
    pending: 'badge-pending',
    overdue: 'badge-overdue',
    paid: 'badge-paid',
    failed: 'badge-failed',
    draft: 'badge-pending',
    sent: 'badge-active',
    refunded: 'badge-paused',
  };

  return (
    <span className={cn('badge', statusMap[status] || 'badge-cancelled', className)}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}
