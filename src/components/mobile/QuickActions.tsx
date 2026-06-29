import Link from "next/link";
import { UserPlus, QrCode, CreditCard, Sparkles } from "lucide-react";

const actions = [
  { href: "/members/new", label: "Add", icon: UserPlus },
  { href: "/attendance/scanner", label: "Check-In", icon: QrCode },
  { href: "/payments", label: "Billing", icon: CreditCard },
  { href: "/ai-insights", label: "AI", icon: Sparkles },
];

export default function QuickActions() {
  return (
    <div className="quick-actions">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.href} href={action.href} className="quick-action-btn">
            <span className="quick-action-icon">
              <Icon size={20} strokeWidth={1.8} />
            </span>
            <span>{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
