# Branch Cleanup and Main Branch Setup Guide

This guide will help you clean up your repository branches and create a proper `main` branch.

## Current State

- **Current Branch:** `claude/implement-user-upload-011CUUSDX8XNRiZrkJWbSkVd`
- **Current Default:** `claude/review-rev-app-011CUQx91UgrVEu8BtXGZdmA` (old)
- **Latest Commit:** `98a52ca` - Add comprehensive documentation for v6.0.0
- **Status:** ✅ All work consolidated, documented, and pushed

## Goal

Create a clean repository with:
- A `main` branch as the default
- Simple, descriptive branch names
- All old branches deleted

---

## Step-by-Step Instructions

### Step 1: Create Main Branch on GitHub

1. Go to your repository on GitHub: `https://github.com/JLawMcGraw/cocktail-analysis`

2. Click the branch dropdown (currently showing the default branch)

3. In the "Find or create a branch" field, type: `main`

4. Click "Create branch: main from 'claude/implement-user-upload-011CUUSDX8XNRiZrkJWbSkVd'"

This creates a new `main` branch with all your latest work.

### Step 2: Set Main as Default Branch

1. Go to **Settings** → **Branches** (in your repository)

2. Under "Default branch", you'll see the current default

3. Click the **switch/arrows icon** (⇄) next to the branch name

4. Select `main` from the dropdown

5. Click **Update**

6. Confirm by clicking **"I understand, update the default branch"**

### Step 3: Delete Old Branches on GitHub

Now that `main` is the default, delete the old branches:

1. Go to your repository's main page

2. Click **"branches"** (shows "X branches")

3. Delete these branches by clicking the trash icon next to each:
   - `claude/implement-user-upload-011CUUSDX8XNRiZrkJWbSkVd` (original work)
   - `claude/review-project-improvements-011CUU8T386Zy12t26mPwffU` (old modular)
   - `claude/review-rev-app-011CUQx91UgrVEu8BtXGZdmA` (old review)
   - `claude/design-modernization-011CUQx91UgrVEu8BtXGZdmA` (if exists)

4. Confirm each deletion

### Step 4: Update Your Local Repository

Run these commands in your terminal:

```bash
# Fetch all updates from GitHub
git fetch --all --prune

# Switch to the new main branch
git checkout main

# Pull the latest changes
git pull origin main

# Delete old local branches
git branch -D claude/implement-user-upload-011CUUSDX8XNRiZrkJWbSkVd
git branch -D claude/review-project-improvements-011CUU8T386Zy12t26mPwffU
git branch -D claude/review-rev-app-011CUQx91UgrVEu8BtXGZdmA

# Clean up remote tracking branches
git remote prune origin
```

### Step 5: Verify Everything

```bash
# Check current branch (should be "main")
git branch

# Check remote branches (should only show "main")
git branch -r

# Verify you have the latest commits
git log --oneline -5
```

You should see:
```
98a52ca Add comprehensive documentation for v6.0.0
28f2e7d Fix AI proxy error handler and shopping list display
d671ace Fix authentication flow: clear data when not logged in
72deeda Resolve merge conflict: use modular version
ca38bc1 Implement user authentication on modular architecture (v6.0.0)
```

---

## Alternative: Use Git Command Line (Advanced)

If you prefer to do this via command line:

```bash
# On your local machine, create main from current branch
git checkout -b main

# Push main to GitHub
git push -u origin main

# On GitHub, change default branch to main via Settings → Branches

# Then delete remote branches
git push origin --delete claude/implement-user-upload-011CUUSDX8XNRiZrkJWbSkVd
git push origin --delete claude/review-project-improvements-011CUU8T386Zy12t26mPwffU
git push origin --delete claude/review-rev-app-011CUQx91UgrVEu8BtXGZdmA

# Clean up local branches
git branch -D claude/implement-user-upload-011CUUSDX8XNRiZrkJWbSkVd
git branch -D claude/review-project-improvements-011CUU8T386Zy12t26mPwffU
git branch -D claude/review-rev-app-011CUQx91UgrVEu8BtXGZdmA

# Clean up remote tracking
git remote prune origin
```

---

## After Cleanup - Your Repository Structure

```
Repository: JLawMcGraw/cocktail-analysis
├── Default Branch: main
├── Latest Commit: 98a52ca (Add comprehensive documentation for v6.0.0)
├── Documentation:
│   ├── README.md (v6.0.0 - Full stack app guide)
│   ├── IMPLEMENTATION.md (48KB technical guide)
│   └── RELEASE_NOTES.md (v6.0.0 release notes)
└── Features:
    ├── User authentication (JWT)
    ├── Persistent data storage (SQLite)
    ├── Auto-sync every 30 seconds
    ├── Cocktail analysis AI
    └── Shopping list generator
```

---

## Future Development

When working on new features:

```bash
# Create a feature branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# Do your work, commit changes
git add .
git commit -m "Add your feature"

# Push feature branch
git push -u origin feature/your-feature-name

# Create a PR to merge into main
```

---

## Troubleshooting

**Q: I don't see the "main" branch after creating it on GitHub**
- A: Refresh the page, or run `git fetch --all` locally

**Q: It won't let me delete the default branch**
- A: Make sure you've set a different branch as the default first (Step 2)

**Q: My local repository is in a weird state**
- A: Run `git fetch --all --prune` and `git checkout main` to reset

**Q: I want to keep a backup of the old branches**
- A: Before deleting, you can create tags:
  ```bash
  git tag backup-old-work claude/implement-user-upload-011CUUSDX8XNRiZrkJWbSkVd
  git push origin backup-old-work
  ```

---

## Summary

After following this guide, you'll have:
- ✅ Clean `main` branch with all latest work
- ✅ Comprehensive v6.0.0 documentation
- ✅ All old branches deleted
- ✅ Simple, standard repository structure

**Total commits in main:** 10+ (all your work consolidated)
**Documentation files:** 3 (README, IMPLEMENTATION, RELEASE_NOTES)
**Features:** Full-stack authentication + persistent storage
