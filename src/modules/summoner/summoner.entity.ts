import { RiotPlatform } from 'src/shared/types/common';
import { RiotSummonerDTO } from './summoner.dto';
import { RiotAccount } from '@modules/account/account.entity';
import { getRegionFromPlatform } from 'src/shared/utils/utils'
import { RiftySDK } from '@rifty';
import { MatchFilters } from '@modules/match/match.dto';
import { RiotMatch } from '@modules/match/match.entity';
import { MatchCollection } from '@modules/match/match.collection';

/**
 * High-level entity representing a Summoner with helper methods.
*/
export class RiotSummoner implements RiotSummonerDTO {
    #sdk: RiftySDK;
    private _data: RiotSummonerDTO;
    private _platform: RiotPlatform;
    private _lastFetched: Date;
    private _account?: RiotAccount;

    constructor(
        sdk: RiftySDK,
        data: RiotSummonerDTO,
        platform: RiotPlatform,
        updatedAt: number,
        account?: RiotAccount
    ) {
        this.#sdk = sdk;
        this._data = data;
        this._platform = platform;
        this._lastFetched = new Date(updatedAt);
        this._account = account;
    }

    get puuid() { return this._data.puuid; }
    get profileIconId() { return this._data.profileIconId; }
    get revisionDate() { return this._data.revisionDate; }
    get summonerLevel() { return this._data.summonerLevel; }
    get platform() { return this._platform }

    /**
     * Returns the associated RiotAccount entity if it was provided during instantiation.
     */
    get account(): RiotAccount | undefined {
        return this._account;
    }

    public async fetchAccount(): Promise<RiotAccount> {
        if (this._account) {
            return this._account;
        }

        const region = getRegionFromPlatform(this.platform);
        const account = await this.#sdk.account.getByPuuid(region, this.puuid);
        
        this._account = account;
        return account;
    }

    /**
     * Retrieves a list of match instances for this summoner.
     * The region is automatically resolved from the summoner's platform.
     * * @param filters - Criteria to filter the match list (e.g., queue, type, count).
     * @returns A promise that resolves to an array of RiotMatch entities.
     */
    public async getMatches(filters: MatchFilters = {}): Promise<MatchCollection> {
        const matches = await this.#sdk.match.getListByPuuid(this.puuid, { summoner: this }, filters);
        return new MatchCollection(matches, filters);
    }

    /**
     * Timestamp of the last successful sync with Riot API / Cache update.
     */
    get lastFetched(): Date {
        return this._lastFetched;
    }

    async fetch(): Promise<this> {
        // Pozivamo API preko SDK-a da osvežimo podatke
        const fresh = await this.#sdk.summoner.getByPuuid(this.platform, this.puuid, { force: true });
        
        this._data = fresh.toDTO();
        this._lastFetched = fresh.lastFetched;
        
        return this;
    }

    /**
     * Converts the entity back to a plain data object.
     */
    toDTO(): RiotSummonerDTO {
        return { ...this._data };
    }

    /**
     * Automatic JSON serialization handler.
     * Excludes the SDK and Account instances to prevent circular JSON errors.
     */
    toJSON() {
        return {
            ...this.toDTO(),
            platform: this.platform,
            lastFetched: this._lastFetched.toISOString(),
            account: this._account?.toJSON()
        };
    }
}