/**
 * In-Memory Cache Utility
 * Đơn giản cho hệ thống nhỏ, có thể nâng cấp lên Redis sau
 */

class InMemoryCache {
  constructor() {
    this.cache = new Map();
    this.cleanupInterval = null;
    this.startCleanup();
  }

  /**
   * Get value from cache
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set value in cache with TTL (in seconds)
   */
  set(key, value, ttlSeconds = null) {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Delete key from cache
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Check if key exists
   */
  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;

    // Check if expired
    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Increment counter (for rate limiting)
   */
  increment(key, ttlSeconds = null) {
    const current = this.get(key) || 0;
    const newValue = current + 1;
    this.set(key, newValue, ttlSeconds);
    return newValue;
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt && item.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Start automatic cleanup (every 5 minutes)
   */
  startCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Stop cleanup interval
   */
  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }
}

// Singleton instance
const cache = new InMemoryCache();

export default cache;

