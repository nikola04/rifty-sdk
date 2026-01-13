import { RiftyBase, RiftyConfig } from "@core/base";

import { MatchContext, RiftySDK, getRegionFromPlatform } from "@rifty";

import { MatchDTO, MatchFilters } from "./match.dto";
import { RiotMatch } from "./match.entity";

/**
 * Service for interacting with the League of Legends Match-V5 API.
 */
export class MatchAPI extends RiftyBase {
    constructor(
        config: RiftyConfig,
        private sdk: RiftySDK,
    ) {
        super(config);
    }

    /**
     * Retrieves a list of match IDs for a given PUUID and wraps them in a MatchCollection.
     * @param puuid - The player's unique PUUID.
     * @param context - The regional or summoner context for the request.
     * @param filters - Optional filters like start index, count, queue type, etc.
     * @returns An Array containing RiotMatch instances.
     */
    public async getListByPuuid(
        puuid: string,
        context: MatchContext,
        filters: MatchFilters = {},
    ): Promise<RiotMatch[]> {
        const cleanFilters = Object.entries(filters).reduce(
            (acc, [key, val]) => {
                if (val !== undefined && val !== null) {
                    acc[key] = String(val);
                }
                return acc;
            },
            {} as Record<string, string>,
        );

        const query = new URLSearchParams(cleanFilters).toString();
        const endpoint = `/lol/match/v5/matches/by-puuid/${puuid}/ids?${query}`;

        // Resolve the regional route (americas, europe, etc.) from context
        const region = context.region || getRegionFromPlatform(context.summoner!.platform);

        const { data } = await this.request<string[]>(region, endpoint, {
            // todo: add caching and rate limiting here
        });

        return data.map(id => new RiotMatch(this.sdk, id, context, null));
    }

    /**
     * Fetches full match data for a specific match ID.
     * @param matchId - The unique match identifier (e.g., "EUW1_12345").
     * @param context - The regional or summoner context for the request.
     * @param options.force - Whether to bypass cache and force a fresh API call.
     * @returns A hydrated RiotMatch instance.
     */
    public async getById(matchId: string, context: MatchContext, options = { force: false }): Promise<RiotMatch> {
        const endpoint = `/lol/match/v5/matches/${encodeURIComponent(matchId)}`;
        const region = context.region || getRegionFromPlatform(context.summoner!.platform);

        const { data } = await this.request<MatchDTO>(region, endpoint, {
            force: options.force,
        });

        return new RiotMatch(this.sdk, matchId, context, data);
    }
}
