import { beforeAll, describe, expect, it } from "vitest";

import { RiftySDK } from "@rifty";

describe("AccountAPI (Integration)", () => {
    const apiKey = process.env.RIOT_API_KEY!;

    const sdk = new RiftySDK({ apiKey, cache: "memory" });

    beforeAll(async () => {
        // Safety check to ensure we only wipe cache in a test environment
        if (process.env.NODE_ENV !== "test") {
            throw new Error("NODE_ENV must be 'test' to run integration tests");
        }

        // todo: should clear all keys
    });

    it("should fetch real account data and manage lastFetched metadata", async () => {
        // 1. Initial network fetch from Riot Games API
        const account = await sdk.account.getByGameNameAndTag("americas", "Faker", "KR1");

        expect(account.puuid).toBeDefined();
        expect(account.lastFetched).toBeInstanceOf(Date);

        const firstSyncTime = account.lastFetched.getTime();
        console.log(`[Test] First fetch (Network) at: ${account.lastFetched.toISOString()}`);

        // 2. Cache Validation: Second call should retrieve the exact same timestamp from Redis
        const cachedAccount = await sdk.account.getByGameNameAndTag("americas", "Faker", "KR1");

        expect(cachedAccount.puuid).toBe(account.puuid);
        expect(cachedAccount.lastFetched.getTime()).toBe(firstSyncTime);
        console.log(`[Test] Cache hit confirmed. Timestamp remains: ${cachedAccount.lastFetched.toISOString()}`);

        // Wait briefly to ensure the clock moves forward for the next sync
        await new Promise(resolve => setTimeout(resolve, 500));

        // 3. Forced Sync: Trigger the internal .fetch() method to bypass cache
        await account.fetch();

        const secondSyncTime = account.lastFetched.getTime();
        console.log(`[Test] Forced sync (Network) at: ${account.lastFetched.toISOString()}`);

        // 4. Assertions: Verify the data was actually refreshed
        expect(secondSyncTime).toBeGreaterThan(firstSyncTime);
        expect(account.gameName).toBe("Faker"); // Data integrity check
        expect(account.tagLine).toBe("KR1");

        console.log(`[Test] Success! Account metadata updated. Latency diff: ${secondSyncTime - firstSyncTime}ms`);
    });
});
