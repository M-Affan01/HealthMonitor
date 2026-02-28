import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Remote Health Monitoring System",
  description: "A centralized web-based monitoring dashboard for remote patient health monitoring with real-time vitals tracking, alerts, and analytics.",
  keywords: ["Health Monitoring", "Patient Care", "Telemedicine", "Vitals Tracking", "Healthcare", "Remote Monitoring"],
  authors: [{ name: "Medical Monitoring Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Smart Remote Health Monitoring System",
    description: "Remote patient health monitoring with real-time vitals tracking and alerts",
    url: "https://health-monitor.local",
    siteName: "HealthMonitorAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Remote Health Monitoring System",
    description: "Remote patient health monitoring with real-time vitals tracking and alerts",
  },
};

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
