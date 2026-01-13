import { RiftySDK } from '@rifty';
import { RiftyBase, RiftyConfig } from '@core/base';
import { RiotRegion } from 'src/shared/types/common';
import { RiotAccount } from './account.entity';
import { RiotAccountDTO } from './account.dto';

export class AccountAPI extends RiftyBase {
    /**
     * @param config Internal configuration
     * @param sdk Reference to the main SDK instance for hydration
     */
    constructor(config: RiftyConfig, private sdk: RiftySDK) {
        super(config);
    }

    /**
     * Fetch account by Game Name and Tag
     * @param location Region
     * @param gameName The Riot ID name
     * @param tagLine The Riot ID tag
     */
    public async getByGameNameAndTag(region: RiotRegion, gameName: string, tagLine: string, options: { force: boolean } = { force: false }): Promise<RiotAccount> {
        const { data, updatedAt } = await this.request<RiotAccountDTO>(region,`/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${tagLine}`, { cacheTTL: 3600, force: options.force });

        return new RiotAccount(this.sdk, data, region, updatedAt);
    }

    /**
     * 
     * @param region Region
     * @param puuid Riot PUUID
     * @returns 
     */
    public async getByPuuid(region: any, puuid: string, options: { force: boolean } = { force: false }): Promise<RiotAccount> {
        const { data, updatedAt } = await this.request<RiotAccountDTO>(region, `/riot/account/v1/accounts/by-puuid/${puuid}`, { cacheTTL: 3600, force: options.force });

        return new RiotAccount(this.sdk, data, region, updatedAt);
    }
}