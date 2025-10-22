# Build Guide - Static Portfolio

This guide ensures clean separation between development and static builds, preventing asset conflicts.

## 🚀 Quick Start

### For Static Preview (Recommended)
```bash
# Clean build and preview
npm run preview:static
```

### For Development
```bash
# Clean dev environment first
npm run dev:clean

# Start development servers
npm run dev
```

## 📋 Available Scripts

### Development Scripts
- `npm run dev:clean` - Clean development environment (stops all servers, removes build artifacts)
- `npm run dev` - Start development servers
- `npm run dev:eleventy` - Start Eleventy development server

### Static Build Scripts
- `npm run build:static:clean` - **RECOMMENDED** - Clean static build with proper asset setup
- `npm run build:static` - Basic static build (may have asset issues)
- `npm run preview:static` - Clean build + start static preview server
- `npm run preview:eleventy` - Start static preview server (requires existing build)

### Individual App Scripts
- `npm run build:web` - Build web app only
- `npm run build:desktop` - Build desktop app only
- `npm run build:eleventy` - Build Eleventy content only

## 🔧 Build Process

The `build:static:clean` script ensures:

1. **Stops all dev servers** to prevent port conflicts
2. **Sets correct environment variables** for static deployment
3. **Cleans previous builds** to prevent stale assets
4. **Builds in correct order**: Eleventy → Web → Desktop
5. **Assembles static files** with proper asset linking
6. **Copies assets to correct locations** for static serving

## 🚨 Common Issues & Solutions

### Port Conflicts
**Problem**: Assets loading from wrong port (3001 vs 5002)
**Solution**: Use `npm run dev:clean` before building

### Missing Assets
**Problem**: 404 errors for CSS/JS/images
**Solution**: Use `npm run build:static:clean` instead of `npm run build:static`

### Development Server Interference
**Problem**: Static site trying to load from dev server
**Solution**: Always stop dev servers before static builds

## 📁 Output Structure

After clean build, assets are organized as:
```
out/
├── web/                    # Web app assets
├── desktop/               # Desktop app assets  
├── _next/                 # Web app _next (linked to root)
├── assets/                # 3D models and images
├── icons/                 # SVG icons
└── [other static files]   # Eleventy content
```

## 🌐 Preview URLs

After running `npm run preview:static`:
- **Web Portfolio**: http://localhost:5002/classes/863.25/people/HayleyBloch/web/
- **Desktop Portfolio**: http://localhost:5002/classes/863.25/people/HayleyBloch/desktop/

## ⚠️ Important Notes

1. **Always use `build:static:clean`** for production builds
2. **Stop dev servers** before static builds to prevent conflicts
3. **Static builds are self-contained** - no dev server dependencies
4. **Assets are served from port 5002** only in static mode

