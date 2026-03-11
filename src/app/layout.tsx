import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
import { Toolbar } from "@/components/layout/toolbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shapers OS — AI-Powered Tools for Entrepreneurs",
  description: "Run AI-powered tools, multi-step workflows, and explore AI features designed for entrepreneurs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-screen overflow-hidden flex bg-background text-foreground antialiased`}
      >
        <Sidebar />
        <div className="flex-1 ml-16 flex flex-col overflow-hidden">
          <Toolbar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
