export default function getPublicPath(path: string): string {
  // Use NEXT_PUBLIC_BASE_PATH when provided (set in production builds that use a basePath)
  const base = typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH : '';

  if (!base) { return path; }
  // Avoid double-prefixing
  if (path.startsWith(base)) { return path; }

  return base + path;
}
