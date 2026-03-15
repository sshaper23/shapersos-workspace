"use client";

/**
 * No-op stubs for @clerk/nextjs during static export builds.
 *
 * Turbopack aliases @clerk/nextjs → this file when STATIC_EXPORT=true.
 * This keeps the bundler happy (no server actions), while giving the
 * static site a working "guest mode" UI.
 *
 * The SSR build (Vercel / `npm run build`) uses the REAL @clerk/nextjs —
 * this file is never touched in that flow.
 */

import type { ReactNode } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function ClerkProvider({
  children,
}: {
  children: ReactNode;
  [key: string]: any;
}) {
  return <>{children}</>;
}

/**
 * In guest mode, always render "signed-in" content (full UI preview)
 * and hide "signed-out" content (sign-in prompts).
 */
export function Show({
  when,
  children,
}: {
  when: "signed-in" | "signed-out";
  children: ReactNode;
}) {
  return when === "signed-in" ? <>{children}</> : null;
}

export function UserButton(_props?: any) {
  // Render a guest avatar placeholder
  return (
    <div className="h-8 w-8 rounded-full bg-[hsl(0_0%_100%/0.08)] flex items-center justify-center">
      <span className="text-xs text-[hsl(0_0%_100%/0.4)]">G</span>
    </div>
  );
}

export function SignIn(_props?: any) {
  return null;
}

export function useUser() {
  return { user: null, isLoaded: true, isSignedIn: false };
}
