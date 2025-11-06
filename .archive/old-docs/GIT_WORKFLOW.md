# Git Workflow Guide - Simple Step-by-Step

This guide provides easy-to-follow instructions for common git tasks in this project.

## Your Branches

- **Main working branch**: `claude/review-rev-app-011CUQx91UgrVEu8BtXGZdmA` (this is your "main" branch)
- **Feature branches**: Like `claude/design-modernization-011CUQx91UgrVEu8BtXGZdmA` (temporary branches for new features)

## Common Workflows

### 1. Getting the Latest Changes (Pull Updates)

When you want to get new changes that were pushed to GitHub:

```powershell
# Step 1: Make sure you're on your main working branch
git checkout claude/review-rev-app-011CUQx91UgrVEu8BtXGZdmA

# Step 2: Pull the latest changes
git pull origin claude/review-rev-app-011CUQx91UgrVEu8BtXGZdmA

# Step 3: Refresh the page in your browser to see the changes
```

**When to use**: After Claude makes changes and you want to see them on your computer.

---

### 2. Merging a Feature Branch into Main

When a feature is done and you want to bring it into your main branch:

```powershell
# Step 1: Update the feature branch first (get latest commits)
git checkout claude/design-modernization-011CUQx91UgrVEu8BtXGZdmA
git pull origin claude/design-modernization-011CUQx91UgrVEu8BtXGZdmA

# Step 2: Switch to your main working branch
git checkout claude/review-rev-app-011CUQx91UgrVEu8BtXGZdmA

# Step 3: Merge the feature branch into main
git merge claude/design-modernization-011CUQx91UgrVEu8BtXGZdmA

# Step 4: Push the merged changes to GitHub
git push -u origin claude/review-rev-app-011CUQx91UgrVEu8BtXGZdmA
```

**When to use**: When you want to make a feature branch part of your main codebase.

---

### 3. Checking What Branch You're On

```powershell
git branch
```

The branch with an asterisk (*) is your current branch.

**Output example:**
```
* claude/review-rev-app-011CUQx91UgrVEu8BtXGZdmA  ← You're here
  claude/design-modernization-011CUQx91UgrVEu8BtXGZdmA
  main
```

---

### 4. Viewing Recent Changes

See what was changed recently:

```powershell
# See last 5 commits
git log --oneline -5

# See what files changed in the latest commit
git show --name-only
```

---

### 5. Checking for New Commits on GitHub

See if there are new changes on GitHub that you don't have locally:

```powershell
# Fetch information from GitHub (doesn't change your files)
git fetch origin

# See if your branch is behind
git status
```

If you see `Your branch is behind`, run:
```powershell
git pull origin claude/review-rev-app-011CUQx91UgrVEu8BtXGZdmA
```

---

### 6. Viewing File Contents from Command Line

```powershell
# View first 20 lines of a file
cat CHANGELOG.md | Select-Object -First 20

# View entire file
cat index.html

# Search for text in a file
cat CHANGELOG.md | Select-String "v5.0"
```

---

## Troubleshooting

### "Already up to date" but you know there are changes

**Problem**: When you try to merge or pull, it says everything is up to date, but you know there are new changes.

**Solution**: You need to update the **source** branch first before merging.

```powershell
# Example: If merging design branch into main, update design FIRST:

# Step 1: Switch to the branch that HAS the changes
git checkout claude/design-modernization-011CUQx91UgrVEu8BtXGZdmA

# Step 2: Pull the latest changes for that branch
git pull origin claude/design-modernization-011CUQx91UgrVEu8BtXGZdmA

# Step 3: Switch back to your main branch
git checkout claude/review-rev-app-011CUQx91UgrVEu8BtXGZdmA

# Step 4: NOW merge the updated branch
git merge claude/design-modernization-011CUQx91UgrVEu8BtXGZdmA
```

---

### Changes not showing in browser

**Problem**: You pulled changes but the webpage looks the same.

**Solutions to try (in order)**:

1. **Hard Refresh**: Press `Ctrl + Shift + R` (or `Ctrl + F5`)
2. **Clear cache**: In browser settings, clear cache and cookies
3. **Check you're opening the right file**: Make sure you're opening the file from the correct folder

---

### WSL vs Windows Confusion

**Problem**: You have two separate copies of the repository (one in WSL, one in Windows).

**Understanding**:
- `/home/user/cocktail-analysis` (WSL - where Claude works)
- `C:\Users\YourName\cocktail-analysis` (Windows - where you work)

These are **separate** folders! Changes in one don't automatically appear in the other.

**Solution**: Always use git to sync:
```powershell
# In your Windows PowerShell, pull changes that Claude made in WSL:
cd C:\Users\YourName\cocktail-analysis
git pull origin claude/review-rev-app-011CUQx91UgrVEu8BtXGZdmA
```

---

## Quick Reference Commands

| Task | Command |
|------|---------|
| Where am I? | `git branch` |
| Get latest changes | `git pull origin claude/review-rev-app-011CUQx91UgrVEu8BtXGZdmA` |
| Switch branch | `git checkout <branch-name>` |
| See recent commits | `git log --oneline -5` |
| Check status | `git status` |
| See what changed | `git diff` |

---

## Step-by-Step: Full Workflow for Getting Claude's Updates

This is the complete process when Claude tells you "I've made changes":

```powershell
# 1. Navigate to your project folder (Windows)
cd C:\Users\YourName\cocktail-analysis

# 2. Check what branch you're on
git branch

# 3. If there's a feature branch mentioned, update it first
git checkout claude/design-modernization-011CUQx91UgrVEu8BtXGZdmA
git pull origin claude/design-modernization-011CUQx91UgrVEu8BtXGZdmA

# 4. Switch back to main working branch
git checkout claude/review-rev-app-011CUQx91UgrVEu8BtXGZdmA

# 5. Merge the feature branch
git merge claude/design-modernization-011CUQx91UgrVEu8BtXGZdmA

# 6. Push the merged result
git push -u origin claude/review-rev-app-011CUQx91UgrVEu8BtXGZdmA

# 7. Open index.html in browser and hard refresh (Ctrl + Shift + R)
```

---

## Visual Guide: Branch Flow

```
┌─────────────────────────────────────────────┐
│  GitHub (Remote Repository)                 │
│  ├─ claude/review-rev-app (main working)   │
│  └─ claude/design-modernization (features)  │
└─────────────────────────────────────────────┘
                    ↕
            git pull / git push
                    ↕
┌─────────────────────────────────────────────┐
│  Your Computer (Local Repository)           │
│  ├─ claude/review-rev-app (main working)   │
│  └─ claude/design-modernization (features)  │
└─────────────────────────────────────────────┘
```

**Key Concept**:
- You have **local** branches on your computer
- You have **remote** branches on GitHub
- `git pull` copies remote → local
- `git push` copies local → remote
- `git merge` combines two local branches

---

## Need Help?

If you're stuck:

1. Run `git status` and copy the output
2. Run `git branch` and note which branch has the asterisk
3. Share both outputs and describe what you're trying to do

Remember: You can't break anything with `git pull`, `git fetch`, or `git status` - these are safe "read-only" commands!

---

Happy coding! 🍹
