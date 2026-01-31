# GitIgnore Update - Backend & SmartContract

## Changes Made

### Updated `.gitignore`
Added the following folders to be ignored:
```
/Backend/
/SmartContract/
```

### Removed from Git Tracking
Executed:
```bash
git rm -r --cached Backend SmartContract
```

This removes the folders from git tracking but **keeps them in your local filesystem**.

## Why?

1. **Backend** and **SmartContract** are separate projects with their own git repositories
2. They should not be committed to the frontend repository
3. Keeping them locally allows for development and testing
4. Each developer can have their own Backend/SmartContract setup

## What This Means

### ✅ What's Kept:
- Folders still exist on your computer
- You can still develop and test locally
- Changes won't be tracked by git

### ❌ What's Removed:
- Folders removed from git history (future commits)
- Won't be pushed to remote repository
- Won't appear in `git status`

## Folder Structure After Commit

```
frontend/
├── .gitignore          ✅ Updated
├── Backend/            🚫 Ignored (local only)
├── SmartContract/      🚫 Ignored (local only)
├── app/                ✅ Tracked
├── components/         ✅ Tracked
├── hooks/              ✅ Tracked
├── lib/                ✅ Tracked
├── public/             ✅ Tracked
├── ABI2/               ✅ Tracked (needed for frontend)
└── ...
```

## Next Steps

### To Commit:
```bash
git add .gitignore
git commit -m "chore: ignore Backend and SmartContract folders"
git push
```

### If You Need Backend/SmartContract in Git:
Create separate repositories:

```bash
# Backend repository
cd Backend
git init
git add .
git commit -m "Initial commit"
git remote add origin <backend-repo-url>
git push -u origin main

# SmartContract repository
cd ../SmartContract
git init
git add .
git commit -m "Initial commit"
git remote add origin <smartcontract-repo-url>
git push -u origin main
```

## Important Notes

1. **ABI2 folder is still tracked** - This contains the contract ABIs needed by frontend
2. **Backend and SmartContract folders still exist locally** - They're just not tracked by git
3. **Other developers need to set up their own Backend/SmartContract** - They won't get these folders when cloning

## Environment Variables

Make sure your `.env.local` has the correct backend URL:
```env
NEXT_PUBLIC_API_URL=https://backend-production-dfd3.up.railway.app
```

Or for local development:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Summary

✅ Backend and SmartContract folders are now gitignored
✅ Folders still exist locally for development
✅ Won't be committed to frontend repository
✅ Ready to commit changes
