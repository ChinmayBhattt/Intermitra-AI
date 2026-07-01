import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Hack The Box — Build and scale a cyber workforce in the AI era",
  description:
    "Equip threat-ready cyber teams for an AI-accelerated landscape with hands-on labs, assessments, and pathways that build top performing teams.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
