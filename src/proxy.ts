import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

/**
 * When Clerk keys are configured, enforce auth on page routes only.
 * API routes are excluded from the middleware matcher entirely.
 * When keys are missing (preview / guest mode), pass through without auth.
 *
 * Uses manual auth() + redirect instead of auth.protect() to avoid
 * Clerk's protect-rewrite returning a 404 page.
 */
const hasClerkKeys =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;

const clerkHandler = hasClerkKeys
  ? clerkMiddleware(async (auth, req) => {
      if (!isPublicRoute(req)) {
        const { userId } = await auth();
        if (!userId) {
          return NextResponse.redirect(new URL("/sign-in", req.url));
        }
      }
    })
  : undefined;

export default function middleware(req: NextRequest) {
  if (clerkHandler) {
    return clerkHandler(req, {} as never);
  }
  // Guest mode — no auth enforcement
  return NextResponse.next();
}

// Exclude _next internals, static files, and API routes from middleware
export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
