import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Penga — Campus Lost & Found Recovery Network",
  description:
    "Fast, intelligent lost and found recovery network. Report lost or found items in under 60 seconds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-canvas text-text-primary flex flex-col font-sans selection:bg-accent-light selection:text-accent antialiased">
        {children}
      </body>
    </html>
  );
}
