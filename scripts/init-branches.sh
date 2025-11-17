#!/bin/bash
# Initialize main and canary branches for AFFiNE-teto

set -e

echo "🚀 Initializing AFFiNE-teto branches..."
echo ""

# Check if we're on the claude branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ ! "$CURRENT_BRANCH" =~ ^claude/ ]]; then
  echo "⚠️  Warning: Not on a claude/ branch. Current branch: $CURRENT_BRANCH"
  echo "This script should be run from the initial claude branch."
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Add upstream remote if it doesn't exist
if ! git remote get-url upstream &>/dev/null; then
  echo "📡 Adding upstream remote..."
  git remote add upstream https://github.com/toeverything/AFFiNE.git
fi

# Fetch upstream
echo "📥 Fetching upstream..."
git fetch upstream

# Check if main branch exists
if git show-ref --verify --quiet refs/heads/main; then
  echo "✅ Main branch already exists"
else
  echo "🌱 Creating main branch from current state..."
  git branch main
  echo "✅ Main branch created (local only)"
  echo "⚠️  You need to push this to GitHub manually due to branch name restrictions:"
  echo "   1. Go to GitHub and create a branch named 'main' from the current claude branch"
  echo "   2. Set 'main' as the default branch in Settings → Branches"
fi

# Check if canary branch exists
if git show-ref --verify --quiet refs/heads/canary; then
  echo "✅ Canary branch already exists"
else
  echo "🌱 Creating canary branch from upstream/canary..."
  git branch canary upstream/canary
  echo "✅ Canary branch created (local only)"
  echo "⚠️  You need to push this to GitHub manually:"
  echo "   1. Go to GitHub and create a branch named 'canary' from upstream/canary"
  echo "   2. Then merge your telemetry-free main branch into it"
fi

echo ""
echo "✨ Branch initialization complete!"
echo ""
echo "📋 Next steps:"
echo "1. On GitHub, manually create 'main' and 'canary' branches"
echo "2. Set 'main' as the default branch"
echo "3. Configure branch protection rules (see SETUP.md)"
echo "4. Enable GitHub Actions"
echo "5. The automated workflows will handle updates from there!"
echo ""
echo "📖 See SETUP.md for detailed instructions."
