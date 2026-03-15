#!/usr/bin/env bash
set -euo pipefail

# ─── ShapersOS → Netlify Staging Deploy ───
# Usage: ./scripts/deploy-staging.sh
#
# First-time setup (one time only):
#   npx netlify-cli login
#   npx netlify-cli sites:create --name shapers-os-staging
#   npx netlify-cli link
#
# Then set env vars in Netlify dashboard:
#   ANTHROPIC_API_KEY, NOTION_API_KEY,
#   NOTION_NORTH_STAR_DB, NOTION_BRAND_GUIDELINES_DB,
#   NOTION_SALES_MECHANISM_DB, NOTION_SKILLS_REGISTRY_DB

echo "🔨 Building Next.js..."
npm run build

echo ""
echo "🚀 Deploying to Netlify staging (draft URL)..."
npx netlify-cli deploy --dir=.next

echo ""
echo "✅ Staging deploy complete! Use the draft URL above to preview."
echo "   To promote to production: npm run deploy:prod"
