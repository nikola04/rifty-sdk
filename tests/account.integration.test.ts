import { RiftySDK, RiotAccount } from "@rifty";
import { describe, expect, it } from "vitest";

describe('SDK Integration Flow', () => {
    const sdk = new RiftySDK({ 
        apiKey: process.env.RIOT_API_KEY!, 
        cache: 'memory'
    });

    it('should perform a full cross-module flow: Account -> Summoner -> Account', async () => {
        // 1. Get Account
        const account = await sdk.account.getByGameNameAndTag('europe', 'Ivan Draskic', 'TATA');
        expect(account).toBeInstanceOf(RiotAccount);

        // 2. Get Summoner from Account instance (Smart Link)
        const summoner = await account.getSummoner('eun1');
        expect(summoner.puuid).toBe(account.puuid);
        expect(summoner.account).toBe(account); // Verified memory link

        // 3. Reverse lookup from Summoner to Account
        const linkedAccount = await summoner.fetchAccount();
        expect(linkedAccount.fullId).toBe(account.fullId);
        
        console.log(`[Account Integration] Verified flow for ${account.fullId} (Level ${summoner.summonerLevel})`);
    });
});