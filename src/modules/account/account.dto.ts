/**
 * Represents the raw account data received from the Riot API
 * Path: /riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}
 */
export interface RiotAccountDTO {
    /**
     * The unique PUUID for the account
     */
    puuid: string;

    /**
     * The game name of the player (e.g., "Hide on bush")
     */
    gameName: string;

    /**
     * The tag line of the player (e.g., "KR1")
     */
    tagLine: string;
}
