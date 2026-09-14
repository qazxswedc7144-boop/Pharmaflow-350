#!/bin/bash
# ==============================================================================
# Git History Pruning Script for Build Artifacts and Cache Folders
# ==============================================================================
# This script removes heavy build artifacts (dist/), dependency caches (node_modules/),
# and environment files (.env) from the entire Git history using git-filter-repo
# or git filter-branch, reducing repository size and preventing push rejections.
# ==============================================================================

echo "=== Git History Artifact Pruning Tool ==="

if [ ! -d ".git" ]; then
  echo "Error: Not a git repository. Initialize git first with 'git init'."
  exit 1
fi

echo "1. Ensuring all build artifacts and node_modules are deleted locally..."
rm -rf node_modules dist .env

echo "2. Checking for git-filter-repo (recommended tool)..."
if command -v git-filter-repo &> /dev/null; then
    echo "Using git-filter-repo to cleanly remove dist/ and node_modules/ from all commits..."
    git filter-repo --path node_modules --path dist --path .env --invert-paths --force
else
    echo "git-filter-repo not found. Using git filter-branch..."
    git filter-branch --force --index-filter \
      "git rm -r --cached --ignore-unmatch node_modules dist .env" \
      --prune-empty --tag-name-filter cat -- --all
    
    echo "Cleaning up git reflog and garbage collection..."
    rm -rf .git/refs/original/
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
fi

echo "=== Pruning completed successfully! ==="
echo "You can now re-add your remote and push cleanly:"
echo "  git remote add origin <your-repository-url>"
echo "  git push -u origin main --force"
