import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/shared/contexts/AuthContext";
import { AppShell } from "@/shared/components/AppShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Studistic — Student Performance Analytics",
  description: "AI-powered student performance monitoring & early-warning system.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased h-screen flex overflow-hidden" style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
        {/* Aurora animated background */}
        <div className="aurora-bg" aria-hidden="true" />

        {/* App shell with auth */}
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
