#!/bin/bash

echo "🧪 Testing Tensorify CLI Authentication..."
echo "========================================"

# Check if CLI is built
if [ ! -f "lib/bin/tensorify.js" ]; then
    echo "❌ CLI not built. Running pnpm run build..."
    pnpm run build
fi

echo ""
echo "1️⃣ Testing CLI help command..."
node lib/bin/tensorify.js --help

echo ""
echo "2️⃣ Testing authentication status..."
node lib/bin/tensorify.js whoami --dev

echo ""
echo "3️⃣ Available commands:"
echo "   • node lib/bin/tensorify.js login --dev    (Start login)"
echo "   • node lib/bin/tensorify.js whoami --dev   (Check profile)"
echo "   • node lib/bin/tensorify.js --version      (Show version)"

echo ""
echo "🔗 To test full authentication:"
echo "   1. Start plugins.tensorify.io: cd ../../services/plugins.tensorify.io && pnpm run dev"
echo "   2. Run login: node lib/bin/tensorify.js login --dev"
echo "   3. Complete browser sign-in"
echo "   4. Check profile: node lib/bin/tensorify.js whoami --dev"

echo ""
echo "✅ CLI is ready for testing!" 