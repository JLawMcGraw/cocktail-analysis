#!/bin/bash

# Branch Cleanup Script
# Run this AFTER you've created the main branch on GitHub and set it as default

set -e  # Exit on error

echo "========================================="
echo "Branch Cleanup Script"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if on correct branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${YELLOW}Current branch: $CURRENT_BRANCH${NC}"
echo ""

# Step 1: Fetch updates
echo -e "${GREEN}Step 1: Fetching updates from GitHub...${NC}"
git fetch --all --prune
echo ""

# Step 2: Check if main exists on remote
if git ls-remote --heads origin main | grep -q main; then
    echo -e "${GREEN}✓ Main branch found on remote${NC}"
    echo ""

    # Step 3: Switch to main
    echo -e "${GREEN}Step 2: Switching to main branch...${NC}"
    git checkout main
    git pull origin main
    echo ""

    # Step 4: Delete old local branches
    echo -e "${GREEN}Step 3: Deleting old local branches...${NC}"

    BRANCHES_TO_DELETE=(
        "claude/implement-user-upload-011CUUSDX8XNRiZrkJWbSkVd"
        "claude/review-project-improvements-011CUU8T386Zy12t26mPwffU"
        "claude/review-rev-app-011CUQx91UgrVEu8BtXGZdmA"
        "claude/design-modernization-011CUQx91UgrVEu8BtXGZdmA"
    )

    for branch in "${BRANCHES_TO_DELETE[@]}"; do
        if git show-ref --verify --quiet refs/heads/$branch; then
            echo "  Deleting local branch: $branch"
            git branch -D $branch
        else
            echo "  Branch not found locally: $branch (skipping)"
        fi
    done
    echo ""

    # Step 5: Clean up remote tracking branches
    echo -e "${GREEN}Step 4: Cleaning up remote tracking branches...${NC}"
    git remote prune origin
    echo ""

    # Step 6: Verify
    echo -e "${GREEN}Step 5: Verification${NC}"
    echo ""
    echo "Current branch:"
    git branch --show-current
    echo ""
    echo "All local branches:"
    git branch -a
    echo ""
    echo "Recent commits:"
    git log --oneline -5
    echo ""

    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}✓ Cleanup complete!${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo "Your repository is now clean with main as the default branch."
    echo ""

else
    echo -e "${RED}✗ Main branch not found on remote${NC}"
    echo ""
    echo "Please create the main branch on GitHub first:"
    echo "1. Go to https://github.com/JLawMcGraw/cocktail-analysis"
    echo "2. Create branch 'main' from 'claude/implement-user-upload-011CUUSDX8XNRiZrkJWbSkVd'"
    echo "3. Set 'main' as the default branch in Settings → Branches"
    echo "4. Run this script again"
    echo ""
    echo "See BRANCH_CLEANUP_GUIDE.md for detailed instructions."
    exit 1
fi
