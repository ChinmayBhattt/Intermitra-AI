import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DMVIron — Gym Management",
  description: "Member management, billing, attendance, and AI-powered insights for DMVIron Gym",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
