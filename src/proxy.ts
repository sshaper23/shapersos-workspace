import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware strategy:
 *
 * When Clerk keys exist, export clerkMiddleware() directly so Clerk gets
 * the real NextFetchEvent (avoids the protect-rewrite 404 that happened
 * when we wrapped it in a custom function with a fake event).
 *
 * The middleware itself is PERMISSIVE — it does NOT protect any routes
 * server-side. Instead, client-side SafeAuthGate handles auth gating
 * and redirects unauthenticated users to /sign-in.
 *
 * API routes are excluded from the middleware matcher entirely.
 */

const hasClerkKeys =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;

// When Clerk is configured, use clerkMiddleware so Clerk can set up
// its auth state (cookies, headers) without protecting any routes.
// When Clerk is NOT configured (guest/preview mode), pass through.
export default hasClerkKeys
  ? clerkMiddleware()
  : function middleware(_req: NextRequest) {
      return NextResponse.next();
    };

// Exclude _next internals, static files, and API routes from middleware
export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)" ],
};
