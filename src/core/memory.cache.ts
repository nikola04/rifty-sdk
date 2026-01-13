import { IRiftyCache } from "./cache";

export class MemoryCache implements IRiftyCache {
    private storage = new Map<string, { data: any; expiresAt: number|null }>();

    async get<T>(key: string): Promise<T | null> {
        const item = this.storage.get(key);
        if (!item) return null;
        if (item.expiresAt !== null && Date.now() > item.expiresAt) {
            this.storage.delete(key);
            return null;
        }
        return item.data as T;
    }

    async set<T>(key: string, value: T, { ttlSeconds }: { ttlSeconds?: number }): Promise<void> {
        this.storage.set(key, {
            data: value,
            expiresAt: !ttlSeconds ? null : Date.now() + ttlSeconds * 1000,
        });
    }

    get isReady(): boolean { return true; }
}