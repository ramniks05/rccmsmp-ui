# Git Setup Instructions

Since there are PowerShell execution issues, please run these commands manually in your terminal:

## Step 1: Initialize Git Repository
```bash
git init
```

## Step 2: Add Remote Repository
```bash
git remote add origin https://github.com/ramniks05/rccmsmp-ui.git
```

## Step 3: Add All Files
```bash
git add .
```

## Step 4: Make First Commit
```bash
git commit -m "Initial commit: Angular 16+ project setup with Material UI"
```

## Step 5: Set Main Branch and Push
```bash
git branch -M main
git push -u origin main
```

## Alternative: Use the Batch Script
You can also run the `init-git.bat` file which contains all these commands:
```bash
init-git.bat
```

**Note:** Make sure you have:
- Git installed on your system
- GitHub credentials configured (or use GitHub Desktop/Personal Access Token)
- Access to push to the repository

