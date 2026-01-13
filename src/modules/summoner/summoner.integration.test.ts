import { describe, it, expect, beforeAll } from 'vitest';
import { RiftySDK } from '@rifty';

describe('SummonerAPI (Integration)', () => {
    const apiKey = process.env.RIOT_API_KEY!;

    const sdk = new RiftySDK({ apiKey, cache: 'memory' });

    beforeAll(async () => {
        // Safety check for NODE_ENV
        if (process.env.NODE_ENV !== 'test') {
            throw new Error("NODE_ENV must be 'test' to run integration tests");
        }

        // Optional: Clear redis test keys
        const client = (sdk.summoner as any).redis;
        if (client?.isReady) {
            const keys = await client.keys('rifty:test:*');
            if (keys.length > 0) await client.del(keys);
        }
    });

    it('should fetch real data and manage lastFetched metadata', async () => {
        // 1. We need a real PUUID. Let's get one via Account API first
        const account = await sdk.account.getByGameNameAndTag('europe', 'Ivan Draskic', 'TATA');
        // 2. Fetch Summoner data
        const summoner = await sdk.summoner.getByPuuid('eun1', account.puuid);

        // 3. Check summoner data
        expect(summoner.puuid).toBe(account.puuid);
        expect(summoner.lastFetched).toBeInstanceOf(Date);
        
        const firstSyncTime = summoner.lastFetched.getTime();
        console.log(`[Test] First fetch at: ${summoner.lastFetched.toISOString()}`);

        // should return same time from cache
        const cachedSummoner = await sdk.summoner.getByPuuid('eun1', account.puuid);
        expect(cachedSummoner.lastFetched.getTime()).toBe(firstSyncTime);
        console.log(`[Test] Cache hit confirmed. Time remains: ${cachedSummoner.lastFetched.toISOString()}`);

        // wait a bit..
        await new Promise(resolve => setTimeout(resolve, 500));

        // 4. Fetch summoner data from API
        await summoner.fetch();
        
        const secondSyncTime = summoner.lastFetched.getTime();
        console.log(`[Test] Forced sync at: ${summoner.lastFetched.toISOString()}`);

        // 5. Check if data is newer
        expect(secondSyncTime).toBeGreaterThan(firstSyncTime);
        expect(summoner.puuid).toBe(account.puuid);

        console.log(`[Test] Success! Data refreshed. Diff: ${secondSyncTime - firstSyncTime}ms`);
    });
});