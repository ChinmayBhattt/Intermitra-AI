"use client";

import BottomNav from "./BottomNav";

export default function MobileShell({
  children,
  showNav = true,
}: {
  children: React.ReactNode;
  showNav?: boolean;
}) {
  return (
    <div className="mobile-viewport">
      <div className="mobile-glow mobile-glow--top" />
      <div className="mobile-glow mobile-glow--bottom" />
      <div className="mobile-phone">
        <div className="mobile-notch" />
        <div className="mobile-screen">{children}</div>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
