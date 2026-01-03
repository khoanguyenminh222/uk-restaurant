/**
 * In-Memory Cache Utility
 * Đơn giản cho hệ thống nhỏ, có thể nâng cấp lên Redis sau
 * Sử dụng globalThis để cache tồn tại qua các lần reload module (Next.js hot reload)
 */

// Use globalThis to persist cache across module reloads (Next.js development mode)
const globalCacheKey = '__uk_restaurant_cache__';

class InMemoryCache {
  constructor() {
    // Check if cache already exists in globalThis (from previous module load)
    if (typeof globalThis !== 'undefined' && globalThis[globalCacheKey]) {
      console.log('[Cache] ♻️ Reusing existing cache from globalThis');
      const existingCache = globalThis[globalCacheKey];
      this.cache = existingCache.cache;
      this.cleanupInterval = existingCache.cleanupInterval;
      // Restart cleanup if interval was cleared
      if (!this.cleanupInterval) {
        this.startCleanup();
      }
    } else {
      console.log('[Cache] 🆕 Creating new cache instance');
      this.cache = new Map();
      this.cleanupInterval = null;
      this.startCleanup();
      // Store in globalThis to persist across module reloads
      if (typeof globalThis !== 'undefined') {
        globalThis[globalCacheKey] = this;
      }
    }
  }

  /**
   * Get value from cache
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      console.log(`[Cache] 🔍 Key not found: ${key}, Total keys: ${this.cache.size}`);
      return null;
    }

    // Check if expired
    if (item.expiresAt && item.expiresAt < Date.now()) {
      console.log(`[Cache] ⏰ Key expired: ${key}, expiresAt: ${new Date(item.expiresAt).toISOString()}, now: ${new Date().toISOString()}`);
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
    console.log(`[Cache] 💾 Set key: ${key}, TTL: ${ttlSeconds}s, expiresAt: ${expiresAt ? new Date(expiresAt).toISOString() : 'never'}, Total keys: ${this.cache.size}`);
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

  /**
   * Get all keys (for debugging)
   */
  getAllKeys() {
    return Array.from(this.cache.keys());
  }
}

// Singleton instance
const cache = new InMemoryCache();

export default cache;

