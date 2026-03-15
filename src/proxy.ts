import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

/**
 * When Clerk keys are configured, enforce auth on all non-public routes.
 * When keys are missing (preview / guest mode), pass through without auth.
 */
const hasClerkKeys =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;

const clerkHandler = hasClerkKeys
  ? clerkMiddleware(async (auth, req) => {
      if (!isPublicRoute(req)) {
        await auth.protect();
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
