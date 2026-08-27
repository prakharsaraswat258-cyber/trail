import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PengaLogo } from "@/components/ui/PengaLogo";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Report Found Item | Penga",
  description:
    "Report a found item on campus in under 60 seconds. Help connect lost belongings with their owners.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-canvas text-text-primary flex flex-col font-sans selection:bg-accent-light selection:text-accent">
        {/* Minimal Accessible Header */}
        <header className="w-full border-b border-border bg-surface/80 backdrop-blur-none sticky top-0 z-20">
          <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/found" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md p-1">
              <PengaLogo size="sm" />
            </Link>
            <div className="text-xs font-medium text-text-secondary bg-surface-alt px-2.5 py-1 rounded-full border border-border">
              Campus Lost & Found
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-[640px] mx-auto px-4 pt-6">
          {children}
        </main>

        {/* Minimal Footer */}
        <footer className="w-full border-t border-border py-6 text-center text-xs text-text-muted mt-auto">
          <div className="max-w-[640px] mx-auto px-4 space-y-1">
            <p>🐉 Penga — Campus Revenue & Asset Protection</p>
            <p className="text-[11px] text-text-muted/80">
              Safe • Verified • Privacy by Default
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
