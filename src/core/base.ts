import { createClient, RedisClientType } from 'redis';
import Bottleneck from 'bottleneck'
import { RiotRegion, RiotPlatform } from 'src/types/common';

export interface RiftyConfig {
  apiKey: string;
  redisUrl?: string;
  redisClient?: RedisClientType;
  cachePrefix?: string;
}

interface CacheWrapper<T> {
    data: T;
    updatedAt: number;
}

export class RiftyBase {
    protected limiter: Bottleneck;
    protected redis?: RedisClientType;

    constructor(protected config: RiftyConfig) {
        this.limiter = new Bottleneck({
            minTime: 50, // 20 req/s
        });

        if (config.redisClient)
            this.redis = config.redisClient;
        else if (config.redisUrl) {
            this.redis = createClient({ url: config.redisUrl });
            this.redis.connect().catch((err) => console.error("RiftySDK: Redis connection failed", err));
        }
    }

    protected async request<T>(region: RiotRegion|RiotPlatform, endpoint: string, cacheTtl = 3600, force = false): Promise<CacheWrapper<T>> {
        const url = `https://${region}.api.riotgames.com${endpoint}`;

        const envPrefix = process.env.NODE_ENV || 'development';
        const prefix = this.config.cachePrefix || `rifty:${envPrefix}`;
        const cacheKey = `${prefix}:riot:cache:${url}`;

        if (this.redis?.isReady && !force) {
            try {
                const cached = await this.redis.get(cacheKey);
                if (cached) return JSON.parse(cached) as CacheWrapper<T>;
            } catch (e) {
                console.warn("RiftySDK Cache Read Error:", e);
            }
        }

        return this.limiter.schedule(async () => {
            const res = await fetch(url, {
                headers: { 'X-Riot-Token': this.config.apiKey }
            });

            if (!res.ok) throw new Error(`Riot API Error: ${res.status}`);

            const data = await res.json() as T;
            const wrapper: CacheWrapper<T> = { data, updatedAt: Date.now() };

            if (this.redis?.isReady){
                this.redis.set(cacheKey, JSON.stringify(wrapper), { EX: cacheTtl }).catch((e) => console.warn("RiftySDK Cache Write Error:", e));
            }

            return wrapper;
        });
    }
}