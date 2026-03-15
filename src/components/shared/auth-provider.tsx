"use client";

import {
  type ReactNode,
  useState,
  useEffect,
  createContext,
  useContext,
} from "react";

/* ─── Types ─── */

interface ClerkUserData {
  user: {
    fullName?: string | null;
    firstName?: string | null;
    imageUrl?: string;
    primaryEmailAddress?: { emailAddress: string } | null;
  } | null;
  isLoaded: boolean;
}

interface AuthContextValue {
  /** true once ClerkProvider has been dynamically loaded and mounted */
  isClerkLoaded: boolean;
  /** User data bridged from Clerk — null in guest mode */
  clerkUser: ClerkUserData;
}

/* ─── Context ─── */

const AuthContext = createContext<AuthContextValue>({
  isClerkLoaded: false,
  clerkUser: { user: null, isLoaded: true },
});

/** Read the current auth state. Works in both Clerk and guest mode. */
export function useAuthState() {
  return useContext(AuthContext);
}

/* ─── SafeClerkProvider ─── */

/**
 * Dynamically loads ClerkProvider at runtime only when the publishable key
 * exists. For static Netlify exports (no Clerk env vars), children render
 * in guest mode with full UI visible.
 *
 * Also bridges Clerk user data into our AuthContext so downstream components
 * can use `useAuthState()` instead of importing directly from @clerk/nextjs.
 */
export function SafeClerkProvider({
  children,
  appearance,
}: {
  children: ReactNode;
  appearance?: Record<string, unknown>;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [clerkModule, setClerkModule] = useState<any>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (key) {
      import("@clerk/nextjs").then((mod) => {
        setClerkModule(mod);
      });
    }
  }, []);

  if (clerkModule) {
    const { ClerkProvider } = clerkModule;
    return (
      <ClerkProvider appearance={appearance}>
        <ClerkBridge clerkModule={clerkModule}>{children}</ClerkBridge>
      </ClerkProvider>
    );
  }

  // No Clerk available — guest mode
  return (
    <AuthContext.Provider
      value={{ isClerkLoaded: false, clerkUser: { user: null, isLoaded: true } }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Internal bridge that runs INSIDE ClerkProvider.
 * Reads Clerk user data via the useUser hook and exposes it through AuthContext.
 */
function ClerkBridge({
  clerkModule,
  children,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clerkModule: any;
  children: ReactNode;
}) {
  // Call useUser from the dynamically-loaded module.
  // This is safe — we always render inside ClerkProvider and call
  // the hook unconditionally at the top of this component.
  const { user, isLoaded } = clerkModule.useUser();

  return (
    <AuthContext.Provider
      value={{ isClerkLoaded: true, clerkUser: { user, isLoaded } }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ─── SafeAuthGate (replaces Clerk <Show>) ─── */

/**
 * Conditional renderer based on auth state.
 * In guest mode (no Clerk), "signed-in" content always renders (full UI preview).
 */
export function SafeAuthGate({
  when,
  children,
}: {
  when: "signed-in" | "signed-out";
  children: ReactNode;
}) {
  const { isClerkLoaded, clerkUser } = useAuthState();
  const [timedOut, setTimedOut] = useState(false);

  // If Clerk is loaded but useUser() hasn't resolved in 10s, assume a problem
  useEffect(() => {
    if (!isClerkLoaded || clerkUser.isLoaded) return;
    const timer = setTimeout(() => setTimedOut(true), 10_000);
    return () => clearTimeout(timer);
  }, [isClerkLoaded, clerkUser.isLoaded]);

  // Guest mode — show the full app UI
  if (!isClerkLoaded) {
    return when === "signed-in" ? <>{children}</> : null;
  }

  // Auth state still loading — show a loading spinner instead of a blank screen
  if (!clerkUser.isLoaded) {
    // Only show loading indicator for the "signed-in" gate (the main app shell).
    // The "signed-out" gate (sign-in page wrapper) stays hidden while loading.
    if (when === "signed-in") {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3">
            {!timedOut ? (
              <>
                <div
                  className="h-8 w-8 rounded-full animate-spin"
                  style={{
                    border: "2px solid hsl(0 0% 100% / 0.1)",
                    borderTopColor: "#0ea5e9",
                  }}
                />
                <span className="text-xs text-muted-foreground">Loading…</span>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  Authentication is taking longer than expected. This may be a
                  temporary DNS issue.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 rounded-lg bg-[#0ea5e9] text-white text-sm hover:bg-[#0ea5e9]/90 transition-colors"
                >
                  Reload page
                </button>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  }

  const isSignedIn = !!clerkUser.user;
  if (when === "signed-in" && isSignedIn) return <>{children}</>;
  if (when === "signed-out" && !isSignedIn) return <>{children}</>;
  return null;
}

/* ─── SafeUserButton ─── */

/**
 * Renders Clerk's UserButton when available, otherwise a guest avatar placeholder.
 */
export function SafeUserButton({
  appearance,
}: {
  appearance?: Record<string, unknown>;
}) {
  const { isClerkLoaded } = useAuthState();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [UserBtn, setUserBtn] = useState<any>(null);

  useEffect(() => {
    if (isClerkLoaded) {
      import("@clerk/nextjs").then((mod) => {
        setUserBtn(() => mod.UserButton);
      });
    }
  }, [isClerkLoaded]);

  if (UserBtn) return <UserBtn appearance={appearance} />;

  // Guest mode fallback
  return (
    <div className="h-8 w-8 rounded-full bg-[hsl(0_0%_100%/0.08)] flex items-center justify-center">
      <span className="text-xs text-[hsl(0_0%_100%/0.4)]">G</span>
    </div>
  );
}
