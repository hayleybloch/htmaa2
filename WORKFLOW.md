# 🚀 Portfolio Deployment Workflow

## For Future Iterations & Updates

### 🎯 **Quick Updates (Recommended)**
For regular content updates, new weeks, or fixes:

```bash
# 1. Make your changes locally
# 2. Test locally
npm run preview:static

# 3. Commit and push to main branch
git add .
git commit -m "Add Week-8 content"
git push origin main

# ✅ GitHub Actions automatically builds and deploys to GitLab!
```

### 🔄 **What Happens Automatically**
When you push to `main` branch:

1. **GitHub Actions triggers** (`.github/workflows/push-to-gitlab.yml`)
2. **Builds** your complete site with proper base paths
3. **Compresses** large assets (videos >20MB, images >2MB)
4. **Deploys** to GitLab: `https://fab.cba.mit.edu/classes/863.25/people/HayleyBloch/`

### 🛠️ **Manual Deployment (If Needed)**

If you need to deploy manually:

```bash
# Full static build and deploy
npm run deploy:static
```

### 📁 **Adding New Content**

#### **New Week:**
1. Add week content to `src/weeks/week-N.md`
2. Add images to `public/images/Week-N/`
3. Update desktop app if needed in `apps/desktop/`

#### **New Images/Assets:**
- **Main portfolio**: Add to `public/images/`
- **Desktop app**: Add to `apps/desktop/public/images/`
- **Large files**: Will be automatically compressed by CI/CD

### 🚨 **Troubleshooting**

#### **If Deployment Fails:**
1. Check **GitHub Actions** log for errors
2. Common issues:
   - Files >25MB (check compression settings)
   - Missing GitLab access token
   - Build errors in apps

#### **Audio/Image 404 Errors:**
- Ensure all paths use `getPublicPath()` in desktop app
- Check that assets exist in correct directories

#### **Local Testing:**
```bash
# Test complete build locally
npm run build:static:clean
npm run preview:eleventy
```

### 🔧 **Maintenance**

#### **Update Dependencies:**
```bash
npm update
npm run build:static:clean  # Test after updates
```

#### **GitLab Token Refresh:**
If deployment starts failing with auth errors:
1. Generate new GitLab access token
2. Update `GITLAB_ACCESS_TOKEN` in GitHub repository secrets

### 📊 **File Size Management**

**Current Limits:**
- GitLab push limit: ~25MB per file
- Auto-compression handles most cases

**Manual Compression (if needed):**
```bash
# For large videos
ffmpeg -i input.mp4 -crf 28 -vf scale=-2:720 output.mp4

# For large images  
convert input.jpg -quality 80 -strip output.jpg
```

### 🎯 **Best Practices**

1. **Always test locally first**: `npm run preview:static`
2. **Keep commits focused**: One week or feature per commit
3. **Use descriptive commit messages**: "Add Week-8: Electronics Design"
4. **Check GitHub Actions**: Verify successful deployment
5. **Monitor file sizes**: Keep assets reasonable

### 📱 **Quick Commands Reference**

```bash
# Development
npm run dev                    # Start all dev servers
npm run preview:static         # Test static build locally

# Building
npm run build:static:clean     # Full clean build
npm run deploy:static         # Build and deploy to GitLab

# Maintenance
npm run lint                  # Check code quality
npm run format               # Format code
```

## 🎉 **That's It!**

Your workflow is automated! Just push to `main` and GitHub Actions handles the rest.

For any issues, check:
1. GitHub Actions logs
2. GitLab repository status
3. This workflow guide