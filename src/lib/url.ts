/**
 * Prefixes a site-relative path with the deploy base
 * (`/between-the-lines` on GitHub Pages). Always build internal hrefs
 * through this helper so the site works under a sub-path.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
}
