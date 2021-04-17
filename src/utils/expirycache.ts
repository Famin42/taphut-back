/**
 * Caches the result of an async function call and refreshes it every X seconds
 */
class ExpiryCache<T> {
  private lastFetchTime: number;
  private expiryMs: number;
  private value: T;
  private fetcher: () => Promise<T>;

  /**
   * Create cache
   * @param expiryMs cache will expire after this many ms
   * @param fetcher async fetcher function
   */
  constructor(expiryMs: number, fetcher: () => Promise<T>) {
    this.fetcher = fetcher;
    this.expiryMs = expiryMs;
  }

  /**
   * Fetch value from cache, or from async call if expired
   */
  public async get() {
    const now = new Date().valueOf();
    const last = this.lastFetchTime;
    if (!last || now - last >= this.expiryMs) {
      this.value = await this.fetcher();
      this.lastFetchTime = now;
    }
    return this.value;
  }
}

export default ExpiryCache;
