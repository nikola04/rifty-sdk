import Bottleneck from "bottleneck";
import { RedisClientType } from "redis";

import { RiotPlatform, RiotRegion } from "@shared/types/common";

import { DummyCache, IRiftyCache } from "./cache";
import { MemoryCache } from "./memory.cache";
import { RedisCache } from "./redis.cache";

export interface RiftyConfig {
    apiKey: string;
    cache?: "memory" | RedisClientType | null;
    cachePrefix?: string;
}

interface CacheWrapper<T> {
    data: T;
    updatedAt: number;
}

export class RiftyBase {
    protected limiter: Bottleneck;
    protected cache: IRiftyCache;

    constructor(protected config: RiftyConfig) {
        this.limiter = new Bottleneck({
            minTime: 50, // 20 req/s
        });

        if (config.cache && isRedisClient(config.cache)) this.cache = new RedisCache(config.cache);
        else if (typeof config.cache === "string" && config.cache === "memory") this.cache = new MemoryCache();
        else this.cache = new DummyCache();
    }

    protected async request<T>(
        region: RiotRegion | RiotPlatform,
        endpoint: string,
        options: { cacheTTL?: number; force?: boolean; limiterName?: string } = {
            cacheTTL: 3600,
            force: false,
            limiterName: "default",
        },
    ): Promise<CacheWrapper<T>> {
        const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
        const url = `https://${region}.api.riotgames.com/${cleanEndpoint}`;

        const envPrefix = process.env.NODE_ENV || "development";
        const prefix = this.config.cachePrefix || `rifty:${envPrefix}`;
        const cacheKey = `${prefix}:riot:cache:${region}:${cleanEndpoint}`;

        if (this.cache.isReady && !options.force) {
            const cached = await this.cache
                .get<CacheWrapper<T>>(cacheKey)
                .catch(e => console.warn("RiftySDK Cache Read Error:", e));
            if (cached) return cached;
        }

        return this.limiter.schedule(async () => {
            const res = await fetch(url, {
                headers: { "X-Riot-Token": this.config.apiKey },
            });

            if (!res.ok) throw new Error(`Riot API Error: ${res.status}`);

            const data = (await res.json()) as T;
            const wrapper: CacheWrapper<T> = { data, updatedAt: Date.now() };

            if (this.cache.isReady) {
                this.cache
                    .set(cacheKey, wrapper, { ttlSeconds: options.cacheTTL })
                    .catch(e => console.warn("RiftySDK Cache Write Error:", e));
            }

            return wrapper;
        });
    }
}

function isRedisClient(cache: unknown): cache is RedisClientType {
    return (
        cache !== null &&
        typeof cache === "object" &&
        "get" in cache &&
        typeof cache.get === "function" &&
        "set" in cache &&
        typeof cache.set === "function"
    );
}
