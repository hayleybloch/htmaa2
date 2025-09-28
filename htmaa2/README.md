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
