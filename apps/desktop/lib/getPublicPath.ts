export default function getPublicPath(path: string): string {
  // During GitHub Pages desktop builds we want emitted asset URLs to point
  // at the deployed desktop subtree (e.g. /htmaa2/desktop/icons/...).
  // next.config.js will expose NEXT_PUBLIC_DESKTOP_BASE for production
  // desktop builds. Fall back to NEXT_PUBLIC_BASE_PATH when a desktop
  // base isn't provided.
  const rawDesktopBase = typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_DESKTOP_BASE
    ? process.env.NEXT_PUBLIC_DESKTOP_BASE
    : '';

  const rawBase = typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_BASE_PATH
    ? process.env.NEXT_PUBLIC_BASE_PATH
    : '';

  // If either env contains a full URL, extract the pathname. This prevents
  // embedding hostnames into emitted image URLs.
  function normalizeRaw(raw: string): string {
    if (!raw) { return ''; }
    try {
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        const u = new URL(raw);
        return u.pathname || '';
      }
    } catch (e) {
      // ignore
    }
    return raw;
  }

  let desktopBase = normalizeRaw(rawDesktopBase);
  let base = normalizeRaw(rawBase);

  // Normalize leading/trailing slashes
  if (desktopBase && !desktopBase.startsWith('/')) { desktopBase = `/${desktopBase}`; }
  if (desktopBase.endsWith('/')) { desktopBase = desktopBase.slice(0, -1); }

  if (base && !base.startsWith('/')) { base = `/${base}`; }
  if (base.endsWith('/')) { base = base.slice(0, -1); }

  const prefix = desktopBase || base;

  if (!prefix) { return path; }
  // Avoid double-prefixing
  if (path.startsWith(prefix + '/') || path === prefix) { return path; }

  // Ensure path begins with '/'
  if (!path.startsWith('/')) { path = `/${path}`; }

  return `${prefix}${path}`;
}
