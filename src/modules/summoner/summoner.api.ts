import { RiftySDK, RiotAccount } from '@rifty';
import { RiotSummonerDTO } from './summoner.dto';
import { RiotSummoner } from './summoner.entity';
import { RiftyBase } from '@core/base';
import { RiotPlatform } from 'src/types/common';

/**
 * Interface for the Summoner-V4 API endpoints.
 */
export class SummonerAPI extends RiftyBase {
    /**
     * @param config - Internal SDK configuration
     * @param sdk - Reference to the main SDK instance
     */
    constructor(config: any, private sdk: RiftySDK) {
        super(config);
    }

    /**
     * Fetch a summoner by their encrypted PUUID.
     * @param platform - The Riot Platform (e.g., 'euw1', 'na1', 'kr')
     * @param puuid - The encrypted PUUID of the player
     * @returns A hydrated RiotSummoner entity
     * @throws Error if the API request fails
     */
    async getByPuuid(platform: RiotPlatform, puuid: string, options: { force?: boolean, account?: RiotAccount | undefined } = { force: false, account: undefined }): Promise<RiotSummoner> {
        const { data, updatedAt } = await this.request<RiotSummonerDTO>(platform, `/lol/summoner/v4/summoners/by-puuid/${puuid}`, 3600, options.force);
        return new RiotSummoner(this.sdk, data, platform, updatedAt, options.account);
    }
}