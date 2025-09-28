# MIT GitLab Deployment Guide

## Size Optimization for 25MB Limit

### Current Size Breakdown
- **Total repo**: 933MB
- **node_modules/**: 580MB (excluded via .gitignore)
- **out/**: 13.6MB (excluded via .gitignore)
- **Assets**: 15MB (need optimization)
- **Source code**: ~20MB (included)

### Asset Optimization Strategy

#### 1. Compress Large Assets
```bash
# Compress GLB files (3D models)
find apps/web/public/assets/ -name "*.glb" -exec gzip -k {} \;

# Optimize images
find apps/web/public/assets/ -name "*.jpg" -exec jpegoptim --max=80 {} \;
find apps/web/public/assets/ -name "*.png" -exec pngquant --ext .png --force {} \;
```

#### 2. Remove Unused Assets
- Review `apps/web/public/assets/` and remove unused 3D models
- Keep only essential icons and images
- Consider using CDN for large assets

#### 3. Alternative Deployment Options

**Option A: Asset Hosting**
- Host large assets on GitHub Pages or external CDN
- Update asset paths in code to point to external URLs
- Keep only essential assets in repo

**Option B: Git LFS (if MIT supports it)**
```bash
git lfs track "*.glb"
git lfs track "*.jpg"
git lfs track "*.mp3"
git add .gitattributes
```

**Option C: Build-time Asset Fetching**
- Store assets externally
- Download during build process
- Add to .gitignore

### Deployment Steps

1. **Clean the repository**:
```bash
# Remove all build artifacts and dependencies
rm -rf node_modules/
rm -rf apps/*/node_modules/
rm -rf apps/*/out/
rm -rf apps/*/.next/
```

2. **Optimize assets**:
```bash
# Run asset compression
npm run optimize-assets  # (create this script)
```

3. **Check final size**:
```bash
du -sh .  # Should be under 25MB
```

4. **Push to MIT GitLab**:
```bash
git remote add mit https://gitlab.cba.mit.edu/classes/863.25/people/HayleyBloch.git
git push mit main
```

### Build Instructions for MIT

Create a `SETUP.md` file with:
```markdown
# Setup Instructions

## Prerequisites
- Node.js 18+
- npm or yarn

## Installation
```bash
npm install
npm run build
npm run start
```

## Development
```bash
npm run dev
```
```

### CI/CD Pipeline
Create `.gitlab-ci.yml`:
```yaml
stages:
  - build
  - deploy

build:
  stage: build
  script:
    - npm install
    - npm run build
  artifacts:
    paths:
      - apps/web/out/
      - apps/desktop/out/

deploy:
  stage: deploy
  script:
    - echo "Deploy to MIT hosting"
  only:
    - main
```
