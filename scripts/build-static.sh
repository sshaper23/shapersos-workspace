#!/usr/bin/env bash
set -euo pipefail

# ─── ShapersOS Static Export for Netlify Drop ───
# Produces an /out folder you can drag into https://app.netlify.com/drop
#
# API routes, dynamic [id] routes, and auth routes are excluded (they need a server).
# Clerk auth uses SafeClerkProvider (dynamic import) — works in both SSR and static modes.
# The full UI is available for visual staging review in guest mode.

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/.static-build-backup"

echo "📦 Building static export for Netlify Drop..."
echo ""

mkdir -p "$BACKUP_DIR"

# 1. Shelve API routes (server-only)
if [ -d "$PROJECT_DIR/src/app/api" ]; then
  echo "  → Shelving API routes..."
  mv "$PROJECT_DIR/src/app/api" "$BACKUP_DIR/api"
fi

# 2. Shelve dynamic [id] route (client-routed, no static params)
if [ -d "$PROJECT_DIR/src/app/sales-mechanism/[id]" ]; then
  echo "  → Shelving sales-mechanism/[id] route..."
  mv "$PROJECT_DIR/src/app/sales-mechanism/[id]" "$BACKUP_DIR/mechanism-id"
fi

# 3. Shelve Clerk sign-in catch-all route (needs server)
if [ -d "$PROJECT_DIR/src/app/sign-in" ]; then
  echo "  → Shelving sign-in route..."
  mv "$PROJECT_DIR/src/app/sign-in" "$BACKUP_DIR/sign-in"
fi

# 4. Shelve Clerk middleware proxy (not supported in static export)
if [ -f "$PROJECT_DIR/src/proxy.ts" ]; then
  echo "  → Shelving Clerk middleware proxy..."
  mv "$PROJECT_DIR/src/proxy.ts" "$BACKUP_DIR/proxy.ts"
fi

# 5. Build static export (STATIC_EXPORT flag triggers output:"export" in next.config.ts)
# No layout swap needed — SafeClerkProvider uses dynamic imports (no server actions).
echo "  → Running next build (static export)..."
if STATIC_EXPORT=true npx next build 2>&1; then
  BUILD_OK=true
else
  BUILD_OK=false
fi

# 6. Restore everything (always, even on failure)
echo "  → Restoring shelved routes..."
if [ -d "$BACKUP_DIR/api" ]; then
  mv "$BACKUP_DIR/api" "$PROJECT_DIR/src/app/api"
fi
if [ -d "$BACKUP_DIR/mechanism-id" ]; then
  mv "$BACKUP_DIR/mechanism-id" "$PROJECT_DIR/src/app/sales-mechanism/[id]"
fi
if [ -d "$BACKUP_DIR/sign-in" ]; then
  mv "$BACKUP_DIR/sign-in" "$PROJECT_DIR/src/app/sign-in"
fi
if [ -f "$BACKUP_DIR/proxy.ts" ]; then
  mv "$BACKUP_DIR/proxy.ts" "$PROJECT_DIR/src/proxy.ts"
fi
rm -rf "$BACKUP_DIR"

if [ "$BUILD_OK" = true ]; then
  echo ""
  echo "✅ Static export complete!"
  echo ""
  echo "   Your drop folder:  $PROJECT_DIR/out"
  echo ""
  echo "   → Drag the 'out' folder into https://app.netlify.com/drop"
  echo ""
  echo "   Note: API routes, auth, & mechanism detail pages are excluded."
  echo "   Full UI is available for visual staging review (guest mode)."
else
  echo ""
  echo "❌ Build failed. Routes have been restored. Check errors above."
  exit 1
fi
