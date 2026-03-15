import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Minimal passthrough middleware.
 *
 * Clerk auth is handled entirely on the client side by SafeClerkProvider
 * and SafeAuthGate. We previously used clerkMiddleware() here, but Clerk v7
 * does a "protect-rewrite" (returns 404) for unauthenticated users even in
 * permissive mode, which breaks the app before the sign-in page can load.
 *
 * Client-side flow:
 * 1. SafeClerkProvider loads Clerk JS and initialises auth
 * 2. SafeAuthGate checks if user is signed in
 * 3. If not signed in, redirects to /sign-in
 * 4. Sign-in page renders Clerk's <SignIn /> component
 */
export default function middleware(_req: NextRequest) {
  return NextResponse.next();
}

// Exclude _next internals, static files, and API routes from middleware
export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)" ],
};
