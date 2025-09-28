# GitHub Pages Deployment Guide

This project is configured to deploy the web app to GitHub Pages automatically.

## 🚀 Quick Setup

### 1. Enable GitHub Pages
1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Under "Source", select "GitHub Actions"
4. The workflow will automatically deploy when you push to `main` or `master` branch

### 2. Repository Configuration
- **Repository URL**: `https://github.com/hayleybloch/htmaa2`
- **Live URL**: `https://hayleybloch.github.io/htmaa2/`
- **Branch**: `main` or `master` (whichever you use)

## 📁 What Gets Deployed

Only the **web app** (`apps/web`) is deployed to GitHub Pages. The desktop app requires Node.js server features that aren't available on static hosting.

## 🔧 Build Configuration

The web app is configured with:
- ✅ Static export (`output: 'export'`)
- ✅ Base path: `/htmaa2/`
- ✅ Asset prefix: `/htmaa2/`
- ✅ Trailing slashes for GitHub Pages compatibility

## 🛠️ Manual Build (Optional)

If you want to test the build locally:

```bash
# Install dependencies
npm ci

# Build for GitHub Pages
npm run build:github --workspace=apps/web

# The static files will be in apps/web/out/
```

## 🔄 Automatic Deployment

The GitHub Actions workflow:
1. Triggers on push to `main`/`master` branch
2. Installs dependencies
3. Builds the web app for production
4. Deploys to GitHub Pages

## 📝 Notes

- The web app includes 3D scene loading with Three.js
- Assets are properly configured for the `/htmaa2/` base path
- The build process handles shader files (`.frag`, `.vert`) correctly

## 🐛 Troubleshooting

If deployment fails:
1. Check GitHub Actions logs
2. Ensure all assets are properly referenced with `/htmaa2/` prefix
3. Verify that the build completes without errors locally
