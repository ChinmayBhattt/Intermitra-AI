"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
}

export default function MobileHeader({ title, showBack, right }: MobileHeaderProps) {
  const router = useRouter();

  return (
    <header className="mobile-header">
      <div className="mobile-header__left">
        {showBack ? (
          <button type="button" className="mobile-back-btn" onClick={() => router.back()} aria-label="Go back">
            <ChevronLeft size={22} />
          </button>
        ) : (
          <span className="mobile-header__spacer" />
        )}
      </div>
      <h1 className="mobile-header__title">{title}</h1>
      <div className="mobile-header__right">{right ?? <span className="mobile-header__spacer" />}</div>
    </header>
  );
}
