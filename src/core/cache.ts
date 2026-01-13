export interface IRiftyCache {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, { ttlSeconds }: { ttlSeconds?: number }): Promise<void>;
    get isReady(): boolean;
}

export class DummyCache implements IRiftyCache {
    async get<T>(): Promise<T | null> { return null; }
    async set(): Promise<void> { return; }
    get isReady(): boolean { return false; }
}