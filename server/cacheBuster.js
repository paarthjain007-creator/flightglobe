/**
 * FlightGlobe Volatile Flight Cache & Invalidation Engine.
 * Features Tiered TTLs, Stale-While-Revalidate pattern, and immediate cache-busting.
 */

export const CACHE_TIERS = {
  TELEMETRY: 12_000,    // 12s for active ADS-B coordinates
  GATE_STATUS: 180_000, // 3 mins for flight gate/delay updates
  SCHEDULES: 900_000,   // 15 mins for static schedule metadata
};

class FlightCacheManager {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Sets a cached flight entry with an explicit TTL tier.
   */
  set(key, data, tierMs = CACHE_TIERS.TELEMETRY) {
    const now = Date.now();
    this.cache.set(key, {
      data,
      expiresAt: now + tierMs,
      staleAt: now + tierMs * 0.75, // Mark stale at 75% TTL for background refresh
      updatedAt: now,
    });
  }

  /**
   * Gets a cached flight entry.
   * Returns { data, isStale, isExpired }
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return { data: null, isStale: true, isExpired: true };

    const now = Date.now();
    const isExpired = now >= entry.expiresAt;
    const isStale = now >= entry.staleAt;

    if (isExpired) {
      this.cache.delete(key);
      return { data: null, isStale: true, isExpired: true };
    }

    return { data: entry.data, isStale, isExpired: false, updatedAt: entry.updatedAt };
  }

  /**
   * Explicitly purges stale entries matching a flight or key pattern.
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern, "i");
    let count = 0;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Clears entire cache instance.
   */
  clear() {
    this.cache.clear();
  }
}

export const flightCache = new FlightCacheManager();
