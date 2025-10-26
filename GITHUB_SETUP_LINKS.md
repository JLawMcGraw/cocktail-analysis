# Quick GitHub Setup Links

Click these links in order:

## Step 1: Create Main Branch
**URL:** https://github.com/JLawMcGraw/cocktail-analysis/branches

1. Click the green "New branch" button (top right)
2. Name: `main`
3. Source: Select `claude/implement-user-upload-011CUUSDX8XNRiZrkJWbSkVd`
4. Click "Create branch"

## Step 2: Change Default Branch
**URL:** https://github.com/JLawMcGraw/cocktail-analysis/settings/branches

1. Look at the VERY TOP of the page (scroll up if needed)
2. You'll see "Default branch" section
3. Click the switch/pencil icon next to the branch name
4. Select `main`
5. Click "Update"
6. Confirm the change

## Step 3: Verify
**URL:** https://github.com/JLawMcGraw/cocktail-analysis

You should now see `main` as the default branch (top left dropdown)

## Step 4: Run Cleanup Script
In your terminal:
```bash
./cleanup-branches.sh
```

---

## Can't Find Default Branch Option?

If you ONLY see "Branch protection rules" in Settings → Branches:

1. **Make sure you created the `main` branch first** (Step 1 above)
2. **Scroll to the TOP of the page** - Default branch is above Branch protection rules
3. **Refresh the page** after creating the main branch
4. **Try the direct URL:** https://github.com/JLawMcGraw/cocktail-analysis/settings/branch_protection_rules/new

If still stuck, you can also:
- Click "Code" tab → Branch dropdown → Right-click `main` → "Set as default branch"
- Or use GitHub's search: Press `/` then type "default branch"

---

## After This Works

Run this in your terminal:
```bash
./cleanup-branches.sh
```

This will clean up all your local branches and switch you to `main`.
