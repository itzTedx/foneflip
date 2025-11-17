interface CacheMetrics {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  averageResponseTime: number;
  cacheSize: number;
  memoryUsage: string;
}

interface CacheInsights {
  recommendations: string[];
  performance: "excellent" | "good" | "fair" | "poor";
  hitRate: number;
  responseTime: number;
}

class CacheMonitor {
  private static instance: CacheMonitor;
  private metrics: Map<string, CacheMetrics> = new Map();
  private requestCounts: Map<string, { hits: number; misses: number; totalTime: number }> = new Map();

  private constructor() {}

  static getInstance(): CacheMonitor {
    if (!CacheMonitor.instance) {
      CacheMonitor.instance = new CacheMonitor();
    }
    return CacheMonitor.instance;
  }

  recordCacheHit(key: string, responseTime: number): void {
    const current = this.requestCounts.get(key) || { hits: 0, misses: 0, totalTime: 0 };
    current.hits++;
    current.totalTime += responseTime;
    this.requestCounts.set(key, current);
  }

  recordCacheMiss(key: string, responseTime: number): void {
    const current = this.requestCounts.get(key) || { hits: 0, misses: 0, totalTime: 0 };
    current.misses++;
    current.totalTime += responseTime;
    this.requestCounts.set(key, current);
  }

  async getMetrics(): Promise<CacheMetrics> {
    const totalHits = Array.from(this.requestCounts.values()).reduce((sum, { hits }) => sum + hits, 0);
    const totalMisses = Array.from(this.requestCounts.values()).reduce((sum, { misses }) => sum + misses, 0);
    const totalRequests = totalHits + totalMisses;
    const totalTime = Array.from(this.requestCounts.values()).reduce((sum, { totalTime }) => sum + totalTime, 0);

    const hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
    const missRate = totalRequests > 0 ? (totalMisses / totalRequests) * 100 : 0;
    const averageResponseTime = totalRequests > 0 ? totalTime / totalRequests : 0;

    return {
      hitRate,
      missRate,
      totalRequests,
      averageResponseTime,
      cacheSize: this.requestCounts.size,
      memoryUsage: "unknown", // Would be populated from Redis stats
    };
  }

  async getInsights(): Promise<CacheInsights> {
    const metrics = await this.getMetrics();
    const recommendations: string[] = [];

    if (metrics.hitRate < 60) {
      recommendations.push("Consider increasing TTL or reviewing invalidation strategy");
    }

    if (metrics.averageResponseTime > 100) {
      recommendations.push("Consider query optimization or cache warming");
    }

    if (metrics.cacheSize > 1000) {
      recommendations.push("Consider implementing eviction policies");
    }

    let performance: CacheInsights["performance"] = "excellent";
    if (metrics.hitRate < 60) performance = "poor";
    else if (metrics.hitRate < 80) performance = "fair";
    else if (metrics.hitRate < 95) performance = "good";

    return {
      recommendations,
      performance,
      hitRate: metrics.hitRate,
      responseTime: metrics.averageResponseTime,
    };
  }

  reset(): void {
    this.requestCounts.clear();
    this.metrics.clear();
  }
}

export { CacheMonitor };

export const getCacheInsights = async (): Promise<CacheInsights> => {
  const monitor = CacheMonitor.getInstance();
  return monitor.getInsights();
};

export const withCacheMonitoring = async <T>(
  dataFetcher: () => Promise<T>,
  cacheKey: string,
  isHit: boolean
): Promise<T> => {
  const monitor = CacheMonitor.getInstance();
  const startTime = Date.now();

  try {
    const result = await dataFetcher();
    const responseTime = Date.now() - startTime;

    if (isHit) {
      monitor.recordCacheHit(cacheKey, responseTime);
    } else {
      monitor.recordCacheMiss(cacheKey, responseTime);
    }

    return result;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    monitor.recordCacheMiss(cacheKey, responseTime);
    throw error;
  }
};
