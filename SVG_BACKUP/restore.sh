#!/bin/bash

# SVG Components Restore Script
# Run this script to restore all SVG components after git revert

echo "🔄 Restoring SVG Components..."

# Restore components to demos project
echo "📦 Restoring components to demos project..."
cp -r components/* ../frontend/demos/components/ui/

# Restore demo pages
echo "📄 Restoring demo pages..."
cp -r demos/* ../frontend/demos/app/

# Restore shared UI components
echo "🎨 Restoring shared UI components..."
cp -r shared-ui/* ../shared/ui/src/components/ui/

# Restore documentation
echo "📚 Restoring documentation..."
cp README.md ../frontend/demos/components/ui/
cp SEPARATED_SECTIONS_README.md ../frontend/demos/components/ui/

echo "✅ SVG components restored successfully!"
echo ""
echo "Next steps:"
echo "1. Install dependencies: cd frontend/demos && pnpm install framer-motion"
echo "2. Start dev server: pnpm run dev"
echo "3. Visit: http://localhost:4000/svg-follow-scroll-demo"
echo ""
echo "See RESTORE_GUIDE.md for detailed instructions."
