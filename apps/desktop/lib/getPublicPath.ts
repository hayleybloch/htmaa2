export default function getPublicPath(path: string): string {
  // During GitHub Pages desktop builds we want emitted asset URLs to point
  // at the deployed desktop subtree (e.g. /htmaa2/desktop/icons/...).
  // next.config.js will expose NEXT_PUBLIC_DESKTOP_BASE for production
  // desktop builds. Fall back to NEXT_PUBLIC_BASE_PATH when a desktop
  // base isn't provided.
  const desktopBase = typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_DESKTOP_BASE
    ? process.env.NEXT_PUBLIC_DESKTOP_BASE
    : '';

  // Use the generic base (e.g. /htmaa2) when desktop-specific base is not set.
  const base = typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_BASE_PATH
    ? process.env.NEXT_PUBLIC_BASE_PATH
    : '';

  const prefix = desktopBase || base;

  if (!prefix) { return path; }
  // Avoid double-prefixing
  if (path.startsWith(prefix)) { return path; }

  return prefix + path;
}
