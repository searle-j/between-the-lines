/**
 * Public view-counter abstraction: pages render <ViewCount/>, ViewCount talks
 * to this interface, and the concrete provider (GoatCounter first, GA4 or
 * others later) stays swappable behind it. Historical baselines from a
 * retired provider can be folded in here as an offset without touching pages.
 *
 * Until a real provider is wired up, the null provider keeps every counter
 * hidden — the site renders no view counts at all.
 */
export interface AnalyticsProvider {
  /** Views for one page path (e.g. `/papers/llms-cant-jump/`), or null when unavailable. */
  getPageViews(path: string): Promise<number | null>;
  /** Total views across the site, or null when unavailable. */
  getTotalViews(): Promise<number | null>;
}

export const nullProvider: AnalyticsProvider = {
  async getPageViews() {
    return null;
  },
  async getTotalViews() {
    return null;
  },
};

/** The provider the site currently uses. Swap here when GoatCounter lands. */
export const provider: AnalyticsProvider = nullProvider;
