# Hayley Bloch - HTMAA Portfolio

A creative portfolio showcasing my work as an HTMAA (How to Make (Almost) Anything) student at MIT, featuring digital fabrication projects, electronics, and creative engineering.

## Live Site
Visit the portfolio at: [https://hayleybloch.github.io/htmaa2/](https://hayleybloch.github.io/htmaa2/)

## About This Portfolio

This interactive portfolio is built as a desktop-like experience where visitors can explore my projects through a simulated operating system interface. The portfolio includes:

- **3D Web Environment**: Interactive 3D scene built with Three.js
- **Desktop Interface**: macOS-inspired desktop experience with applications and file system
- **Project Showcase**: Detailed views of my HTMAA projects and creative work
- **Terminal Interface**: Command-line experience for technical projects

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **3D Graphics**: Three.js
- **Styling**: CSS Modules
- **Build System**: Turborepo
- **Deployment**: GitHub Pages

## Development

### Prerequisites
- Node.js 22.x
- npm

### Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/hayleybloch/htmaa2.git
   cd htmaa2/Portfolio-next
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development servers:
   ```bash
   # Web app (3D environment) - http://localhost:3000
   npm run dev

   # Desktop app (OS interface) - http://localhost:3001
   cd apps/desktop && npm run dev
   ```

### Building for Production

```bash
npm run build
```

### Static preview (dev)

Use the static preview to build both `apps/web` and `apps/desktop`, copy the desktop export into the web export, fix paths for GitHub Pages-style hosting, and serve the combined static files locally. This is useful to verify the exact static output before committing and publishing.

1. From the repo root, install deps (if you haven't already):
```bash
npm install
```

2. Start the full static dev preview (example uses port 5002):
```bash
npm run preview:full-static:dev -- 5002
```

What this does:
- Runs production `npm run build` for `apps/web` and `apps/desktop` (Next build).
- Uses the generated `out/` directories (Next >=15 may generate `out/` during `next build` when `output: 'export'` is configured).
- Copies `apps/desktop/out` into `apps/web/out/desktop` and runs `scripts/fix_export_paths.js` to rewrite HTML/CSS paths so assets resolve under `/htmaa2/desktop/...`.
- Merges `apps/web/out/_next/static` into `apps/web/out/desktop/_next/static` so hashed `_next` assets referenced by desktop pages are available.
- Starts a small static server and watches source files; rebuilding + restarting automatically on changes.

3. Open the preview in your browser:

```
http://localhost:5002/htmaa2/
```

Troubleshooting tips:
- If you get `EADDRINUSE` or a port conflict, choose another port and pass it after `--` (for example `-- 5003`).
- If a browser asset returns 404, confirm the asset exists on disk:
   ```bash
   ls -la apps/web/out/desktop/_next/static/css
   curl -I http://localhost:5002/htmaa2/desktop/_next/static/css/<that-file>.css
   ```
- If there are multiple lockfiles or Next warns about workspace root, set `outputFileTracingRoot` in your Next config or remove unused lockfiles.


## Project Structure

- `apps/web/` - 3D web environment and scene loader
- `apps/desktop/` - Desktop OS interface with applications
- `packages/` - Shared packages and configurations

## Contact

For questions about my work or this portfolio, feel free to reach out!

---

*Built with ❤️ by Hayley Bloch*
# Updated Sat Sep 27 20:25:33 EDT 2025
# Force rebuild Sat Sep 27 20:30:44 EDT 2025
