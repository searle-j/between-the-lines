/**
 * Public view-counter adapter. Components fetch counts client-side through
 * this module, so the concrete provider (GoatCounter now, GA4/others later)
 * stays swappable without touching any page.
 *
 * Every function returns null when a count is unavailable — the counter
 * setting is off, there is no data yet, or the request fails (network/CORS).
 * Callers keep the counter hidden on null, so the site degrades silently.
 *
 * GoatCounter visitor-counter API:
 *   GET https://<code>.goatcounter.com/counter/<encoded path>.json
 *   -> { "count": "1,234", ... }   (formatted string; site total uses "TOTAL")
 * Requires "Allow adding visitor counts on your website" enabled in settings.
 */
const ENDPOINT = 'https://between-the-lines.goatcounter.com/counter';

async function fetchCount(key: string): Promise<number | null> {
  try {
    const res = await fetch(`${ENDPOINT}/${encodeURIComponent(key)}.json`);
    if (!res.ok) return null;
    const { count } = await res.json();
    const n = Number(String(count).replace(/,/g, ''));
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** Views for one site path, e.g. `/between-the-lines/papers/llms-cant-jump/`. */
export function getPageViews(path: string): Promise<number | null> {
  return fetchCount(path);
}

/** Site-wide total views. */
export function getTotalViews(): Promise<number | null> {
  return fetchCount('TOTAL');
}
