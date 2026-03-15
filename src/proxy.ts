import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health",
]);

/**
 * When Clerk keys are configured, enforce auth on all non-public routes.
 * When keys are missing (preview / guest mode), pass through without auth.
 *
 * Uses auth() + redirectToSignIn() instead of auth.protect() to ensure
 * unauthenticated users are redirected to /sign-in rather than seeing a 404.
 */
const hasClerkKeys =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;

const clerkHandler = hasClerkKeys
  ? clerkMiddleware(async (auth, req) => {
      if (!isPublicRoute(req)) {
        const { userId } = await auth();
        if (!userId) {
          const signInUrl = new URL("/sign-in", req.url);
          return NextResponse.redirect(signInUrl);
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

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
