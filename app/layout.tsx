import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ToastProvider } from "@/components/ToastProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import CommandPalette from "@/components/CommandPalette";
import QuickActions from "@/components/QuickActions";
import ThemeToggle from "@/components/ThemeToggle";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Job Application Tracker",
  description: "Track your job applications, contacts, and referrals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            <div className="flex h-screen bg-[#0a0a0a]">
              <Sidebar />
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
              <CommandPalette />
              <QuickActions />
              <ThemeToggle />
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
