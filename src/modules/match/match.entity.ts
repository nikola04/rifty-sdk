import { getRegionFromPlatform, MatchContext, RiftySDK, RiotRegion, RiotSummoner } from "@rifty";
import { InfoDTO, MatchDTO, ParticipantDTO } from "./match.dto";

export class RiotMatch {
    #sdk: RiftySDK;
    #summoner: RiotSummoner | null;
    #region: RiotRegion;
    /** The unique identifier for the match (e.g., "EUW1_12345678") */
    public readonly matchId: string;
    /** Raw match data retrieved from the Riot API. Null if not yet fetched. */
    private _data: MatchDTO | null;

    constructor(sdk: RiftySDK, matchId: string, context: MatchContext, data?: MatchDTO | null) {
        if (!context || (!context.region && !context.summoner))
            throw new Error("Use valid region on summoner for creating match entity");

        this.#sdk = sdk;
        this.matchId = matchId;
        this._data = data ? data : null;
        this.#summoner = context.summoner ? context.summoner : null;
        this.#region = context.summoner ? getRegionFromPlatform(context.summoner?.platform) : context.region;
    }

    /**
     * Hydrates the match entity with full data from the API.
     * @param options.force - If true, ignores cache and performs a fresh API call.
     */
    public async fetch(options = { force: false }): Promise<this> {
        if (this._data && !options.force) return this;

        const match = await this.#sdk.match.getById(this.matchId, { region: this.#region }, options);
        
        this._data = match._data;
        return this;
    }

    /** Returns the summoner instance associated with this match, if any. */
    get summoner(): RiotSummoner | null {
        return this.#summoner;
    }

    /**
     * Finds and returns the participant data for the owner of this match instance.
     * @returns ParticipantDTO or null if data is not fetched or owner is missing.
     */
    public getMe(): ParticipantDTO | null {
        if (!this.info || !this.summoner) return null;
        
        return this.info.participants.find(p => p.puuid === this.summoner!.puuid) || null;
    }

    /** Checks if the match data has been successfully fetched and populated. */
    get isFetched(): boolean {
        return !!this._data;
    }

    /** Returns the general match information. Call .fetch() first to ensure data is available. */
    get info(): InfoDTO | null {
        return this._data ? this._data.info : null;
    }

    get metadata() {
        if (!this._data)
            return null;
        return this._data.metadata;
    }

    public unload(): void {
        this._data = null;
    }
}