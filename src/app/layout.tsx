import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  SafeClerkProvider,
  SafeAuthGate,
} from "@/components/shared/auth-provider";
import { AppProvider } from "@/context/app-context";
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
        <SafeClerkProvider
          appearance={{
            elements: {
              userButtonPopoverCard:
                "bg-[#0a0d1f] border-[hsl(0_0%_100%/0.08)]",
              userButtonPopoverActionButton:
                "text-[hsl(0_0%_100%/0.7)] hover:bg-[hsl(0_0%_100%/0.06)]",
              userButtonPopoverActionButtonText: "text-[hsl(0_0%_100%/0.7)]",
              userButtonPopoverActionButtonIcon: "text-[hsl(0_0%_100%/0.5)]",
              userButtonPopoverFooter: "hidden",
            },
          }}
        >
          <AppProvider>
            <SafeAuthGate when="signed-in">
              <Sidebar />
              <div className="flex-1 ml-16 flex flex-col overflow-hidden">
                <Toolbar />
                <main className="flex-1 overflow-auto">{children}</main>
              </div>
            </SafeAuthGate>
            <SafeAuthGate when="signed-out">
              <div className="flex-1 h-full">{children}</div>
            </SafeAuthGate>
          </AppProvider>
        </SafeClerkProvider>
      </body>
    </html>
  );
}
