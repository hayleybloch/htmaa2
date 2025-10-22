export default function getPublicPath(path: string): string {
  // During production/static builds we want emitted asset URLs to point
  // at the deployed subtree (e.g. /htmaa2/desktop/icons/...).
  // next.config.js will expose NEXT_PUBLIC_DESKTOP_BASE for production
  // desktop builds. Fall back to NEXT_PUBLIC_BASE_PATH when a desktop
  // base isn't provided.

  // In development we always want local, unprefixed paths so the dev
  // server serves assets from the local public/ folder. This avoids
  // manually toggling env vars when switching between dev and static
  // preview builds.
  const isDev = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development';
  if (isDev) { return path; }

  const desktopBase = typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_DESKTOP_BASE
    ? process.env.NEXT_PUBLIC_DESKTOP_BASE
    : '';

  const base = typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_BASE_PATH
    ? process.env.NEXT_PUBLIC_BASE_PATH
    : '';

  const prefix = desktopBase || base;

  if (!prefix) { return path; }
  // Avoid double-prefixing
  if (path.startsWith(prefix)) { return path; }

  return prefix + path;
}
