import { RiotPlatform, RiotRegion } from 'src/types/common';
import { RiotAccountDTO } from './account.dto';
import { RiftySDK } from '@rifty';
import { RiotSummoner } from '@modules/summoner/summoner.entity';

/**
 * High-level entity representing a Riot Account.
 */
export class RiotAccount implements RiotAccountDTO {
    #sdk: RiftySDK;
    private _data: RiotAccountDTO;
    private _region: RiotRegion;
    private _lastFetched: Date;
    constructor(
        sdk: RiftySDK,
        data: RiotAccountDTO,
        region: RiotRegion,
        updatedAt: number
    ) {
        this.#sdk = sdk;
        this._data = data;
        this._region = region;
        this._lastFetched = new Date(updatedAt);
    }

    get puuid() { return this._data.puuid; }
    get gameName() { return this._data.gameName; }
    get tagLine() { return this._data.tagLine; }
    get region() { return this._region; }

    /**
     * Helper to get the full Riot ID string (e.g. "Faker#KR1")
     */
    get fullId(): string {
        return `${this.gameName}#${this.tagLine}`;
    }

    /**
     * Timestamp of the last successful sync with Riot API / Cache update.
     */
    get lastFetched(): Date {
        return this._lastFetched;
    }

    async fetch(): Promise<this> {
        const fresh = await this.#sdk.account.getByGameNameAndTag(this.region, this.gameName, this.tagLine, { force: true });

        this._data = fresh.toDTO();
        this._lastFetched = fresh.lastFetched;

        return this;
    }

    /**
     * Smart Link: Fetches summoner data for this account on a specific platform.
     * @param platform - The Riot Platform (e.g., 'euw1', 'kr')
     */
    async getSummoner(platform: RiotPlatform): Promise<RiotSummoner> {
        // We leverage the existing summoner module using the account's PUUID
        return this.#sdk.summoner.getByPuuid(platform, this.puuid, { account: this });
    }

    /**
     * Serializes the entity to a clean DTO.
     */
    toDTO(): RiotAccountDTO {
        return { ...this._data };
    }

    toJSON() {
        return ({
            ...this.toDTO(),
            fullId: this.fullId,
            lastFetched: this._lastFetched.toISOString()
        });
    }
}