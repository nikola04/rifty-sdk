import { describe, it, expect, beforeAll } from 'vitest';
import { RiftySDK } from "@rifty"; 
import { MatchCollection } from "./match.collection";
import { RiotMatch } from "./match.entity";
import 'dotenv/config';

describe('Match Module (Integration)', () => {
    let sdk: RiftySDK;
    let puuid: string;
    let summonerInstance: any;

    beforeAll(async () => {
        sdk = new RiftySDK({
            apiKey: process.env.RIOT_API_KEY!,
            cache: 'memory'
        });

        const account = await sdk.account.getByGameNameAndTag('europe', "Ivan Draskic", "TATA");
        summonerInstance = await account.getSummoner("eun1");
        puuid = account.puuid;
    });

    it('should hydrate a specific match (EUN1_3890366915) and verify data integrity', async () => {
        const matchId = 'EUN1_3890366915';
        
        const match = await sdk.match.getById(matchId, { region: 'europe' });

        expect(match).toBeInstanceOf(RiotMatch);
        expect(match.matchId).toBe(matchId);
        expect(match.isFetched).toBe(true);

        const info = match.info;
        expect(info).not.toBeNull();
        expect(typeof info?.gameDuration).toBe('number');
        expect(info?.participants.length).toBe(10);

        const p1 = info?.participants[0];
        expect(p1).toBeDefined();
        expect(typeof p1?.kills).toBe('number');
        expect(typeof p1?.championName).toBe('string');
        expect(p1?.puuid).toMatch(/^[a-zA-Z0-9_-]+$/);

        expect(info?.teams.length).toBe(2);
        expect(info?.teams[0].objectives.tower.kills).toBeDefined();
    });

    it('MatchAPI.getListByPuuid should return a flat array of RiotMatch entities', async () => {
        const matches = await sdk.match.getListByPuuid(puuid, { region: 'europe' }, { count: 5 });

        expect(Array.isArray(matches)).toBe(true);
        expect(matches[0]).toBeInstanceOf(RiotMatch);
        expect(matches.length).toBeLessThanOrEqual(5);
    });

    it('Summoner.getMatches should return a MatchCollection instance', async () => {
        const collection = await summonerInstance.getMatches({ count: 10 });

        expect(collection).toBeInstanceOf(MatchCollection);
        expect(collection.count).toBeGreaterThan(0);
        
        expect(collection.meta).not.toBeNull();
        expect(collection.meta?.count).toBe(10);
    });

    it('MatchCollection should calculate winrate after fetchAll', async () => {
        const collection = await summonerInstance.getMatches({ count: 3 });

        await collection.fetchAll({ concurrency: 3 });

        const winrate = collection.getWinrate();
        
        console.log(`[Integration Test] Winrate for ${summonerInstance.name}: ${(winrate * 100).toFixed(2)}%`);
        
        expect(typeof winrate).toBe('number');
        expect(winrate).toBeGreaterThanOrEqual(0);
        expect(winrate).toBeLessThanOrEqual(1);
    });
});