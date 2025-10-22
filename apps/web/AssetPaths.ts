// apps/web/AssetPaths.ts

/**
 * Build a URL that works both locally and on GitHub Pages.
 * Local uses "", so "/assets/Desk.glb".
 * Pages uses "/htmaa2", so "/htmaa2/assets/Desk.glb".
 */
export function withBase(p: string): string {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const path = p.startsWith("/") ? p : `/${p}`;
    return `${base}${path}`;
  }
  
  /**
   * Root of your site, useful for iframe or internal links.
   * Local becomes "/", Pages becomes "/htmaa2/".
   */
  export function siteRoot(): string {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    return base.endsWith("/") ? base : `${base}/`;
  }
  