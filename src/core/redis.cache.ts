import { RedisClientType } from 'redis';
import { IRiftyCache } from './cache';

export class RedisCache implements IRiftyCache {
    constructor(private client: RedisClientType) {}

    async get<T>(key: string): Promise<T | null> {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }

    async set<T>(key: string, value: T, { ttlSeconds }: { ttlSeconds?: number }): Promise<void> {
        await this.client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    }

    get isReady(): boolean {
        return this.client.isReady;
    }
}