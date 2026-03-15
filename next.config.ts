import type { NextConfig } from "next";

const isStatic = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  // For static export (Netlify Drop), run: ./scripts/build-static.sh
  // That script temporarily enables output: "export" during build.
  //
  // For full SSR deploy (Netlify CLI / Vercel), use: npm run build
  ...(isStatic && {
    output: "export",
    images: { unoptimized: true },
  }),

  // During static export, replace @clerk/nextjs with a no-op stub so the
  // bundler never sees Clerk's server actions (incompatible with output:"export").
  // SafeClerkProvider skips the import at runtime when no publishable key exists.
  ...(isStatic && {
    turbopack: {
      resolveAlias: {
        "@clerk/nextjs": "./src/stubs/clerk-stub.tsx",
        "@clerk/nextjs/server": "./src/stubs/clerk-stub.tsx",
      },
    },
  }),
};

export default nextConfig;
