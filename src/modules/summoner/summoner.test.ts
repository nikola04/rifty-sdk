import { beforeEach, describe, expect, it, vi } from "vitest";

import { RiftySDK, RiotAccount } from "@rifty";

import { RiotSummoner } from "./summoner.entity";

describe("SummonerAPI (Unit)", () => {
    const sdk = new RiftySDK({ apiKey: "test-key", cache: "memory" });

    const mockData = {
        puuid: "puuid-123",
        profileIconId: 1,
        revisionDate: 123456789,
        summonerLevel: 30,
    };

    const mockWrapper = {
        data: mockData,
        updatedAt: Date.now(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should fetch summoner by PUUID and return a RiotSummoner entity", async () => {
        const requestSpy = vi.spyOn(sdk.summoner as any, "request").mockResolvedValue(mockWrapper);

        const result = await sdk.summoner.getByPuuid("euw1", "puuid-123");

        expect(result).toBeInstanceOf(RiotSummoner);
        expect(result.summonerLevel).toBe(30);
        expect(result.lastFetched).toBeInstanceOf(Date);

        expect(requestSpy).toHaveBeenCalledWith(
            "euw1",
            "/lol/summoner/v4/summoners/by-puuid/puuid-123",
            expect.objectContaining({
                cacheTTL: 3600,
                force: false,
            }),
        );
    });

    it("should lazily fetch account data when fetchAccount is called", async () => {
        const summoner = new RiotSummoner(sdk, { puuid: "p-123" } as any, "eun1", Date.now());

        // Mock Account API response
        const mockAccount = new RiotAccount(
            sdk,
            { puuid: "p-123", gameName: "Ivan", tagLine: "T" },
            "europe",
            Date.now(),
        );
        const getAccountSpy = vi.spyOn(sdk.account, "getByPuuid").mockResolvedValue(mockAccount);

        // First call - should trigger API
        const account = await summoner.fetchAccount();
        expect(account.gameName).toBe("Ivan");
        expect(getAccountSpy).toHaveBeenCalledTimes(1);

        // Second call - should return cached property without calling API again
        await summoner.fetchAccount();
        expect(getAccountSpy).toHaveBeenCalledTimes(1);
    });

    it("should prevent circular references in toJSON", () => {
        const account = new RiotAccount(sdk, { puuid: "p-1", gameName: "N", tagLine: "T" }, "europe", Date.now());
        const summoner = new RiotSummoner(
            sdk,
            { puuid: "p-1", summonerLevel: 100 } as any,
            "euw1",
            Date.now(),
            account,
        );

        const json = JSON.parse(JSON.stringify(summoner));

        expect(json.summonerLevel).toBe(100);
        expect(json.account).toBeDefined();
        expect(json.account.gameName).toBe("N");
        // Ensure SDK internal state didn't leak into JSON
        expect(json.sdk).toBeUndefined();
    });

    it("should correctly serialize to JSON via toJSON including lastFetched", async () => {
        const fixedTime = 1700000000000;
        const summoner = new RiotSummoner(sdk, mockData, "eun1", fixedTime);
        const json = summoner.toJSON();

        expect(json).toMatchObject(mockData);
        expect(json.lastFetched).toBe(new Date(fixedTime).toISOString());
        expect(json).not.toHaveProperty("sdk");
    });
});
