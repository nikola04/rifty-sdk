import { RedisClientType } from "redis";

import { IRiftyCache } from "./cache";
import { CacheError } from "./cache.errors";

export class RedisCache implements IRiftyCache {
    constructor(private client: RedisClientType) {}

    async get<T>(key: string): Promise<T | null> {
        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error: unknown) {
            throw new CacheError("GET_CACHE", `Failed to set key: ${key}`, error);
        }
    }

    async set<T>(key: string, value: T, { ttlSeconds }: { ttlSeconds?: number }): Promise<void> {
        try {
            await this.client.set(key, JSON.stringify(value), { EX: ttlSeconds });
        } catch (error: unknown) {
            throw new CacheError("SET_CACHE", `Failed to set key: ${key}`, error);
        }
    }

    get isReady(): boolean {
        return this.client.isReady;
    }
}
