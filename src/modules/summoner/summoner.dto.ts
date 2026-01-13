/**
 * Represents the raw response from Riot Summoner-V4 API.
 * @see https://developer.riotgames.com/apis#summoner-v4
 */
export interface RiotSummonerDTO {
    /** * Encrypted PUUID. Exact length 78 characters.
     * Global unique identifier across all Riot games.
     */
    puuid: string;
    /** * ID of the summoner icon associated with the summoner.
     */
    profileIconId: number;
    /** * Date summoner was last modified specified as epoch milliseconds.
     */
    revisionDate: number;
    /** * Summoner level associated with the summoner.
     */
    summonerLevel: number;
}
