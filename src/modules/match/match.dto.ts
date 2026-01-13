/**
 * Query parameters for filtering match history lists.
 * @see {@link https://developer.riotgames.com/apis#match-v5/GET_getMatchIdsByPUUID}
 */
export interface MatchFilters {
    /** * Epoch timestamp in seconds. 
     * The match list will only include matches played after this date.
     */
    startTime?: number;

    /** * Epoch timestamp in seconds. 
     * The match list will only include matches played before this date.
     */
    endTime?: number;

    /** * Filter by a specific queue ID. 
     * Common IDs: 420 (Ranked Solo), 440 (Ranked Flex), 450 (ARAM).
     */
    queue?: number;

    /** * Filter by match type. 
     */
    type?: 'ranked' | 'normal' | 'tourney' | 'tutorial';

    /** * The index to start fetching matches from (defaults to 0). 
     * Use this for pagination.
     */
    start?: number;

    /** * The number of match IDs to return (defaults to 20, maximum 100).
     */
    count?: number;
}

/**
 * Data Transfer Object for Match-V5 responses.
 * @see {@link https://developer.riotgames.com/apis#match-v5}
 */
export interface MatchDTO {
    /** Match metadata including participants and versioning */
    metadata: MetadataDTO;
    /** Detailed match information, statistics, and results */
    info: InfoDTO;
}

/**
 * Metadata for the match
 */
export interface MetadataDTO {
    /** Match data version */
    dataVersion: string;
    /** The unique match ID (e.g., "EUW1_12345678") */
    matchId: string;
    /** List of participant PUUIDs in the match */
    participants: string[];
}

/**
 * Detailed information about the match
 */
export interface InfoDTO {
    /** Unix timestamp for when the game was created on the game server */
    gameCreation: number;
    /** Game length in seconds (post patch 11.20) */
    gameDuration: number;
    /** Unix timestamp for when the match ended on the game server */
    gameEndTimestamp: number;
    /** Internal Riot game ID */
    gameId: number;
    /** Game mode (e.g., "CLASSIC", "ARAM") */
    gameMode: string;
    /** Game name (e.g., "teambuilder-match-123") */
    gameName: string;
    /** Unix timestamp for when the match started on the game server */
    gameStartTimestamp: number;
    /** Game type (e.g., "MATCHED_GAME") */
    gameType: string;
    /** The patch version the game was played on */
    gameVersion: string;
    /** Map ID (e.g., 11 for Summoner's Rift) */
    mapId: number;
    /** List of participants and their detailed stats */
    participants: ParticipantDTO[];
    /** Platform where the match was played */
    platformId: string;
    /** Queue ID (e.g., 420 for Solo/Duo) */
    queueId: number;
    /** Team statistics and objectives */
    teams: TeamDTO[];
    /** Tournament code used to generate the match (if applicable) */
    tournamentCode?: string;
}

/**
 * Detailed statistics for a single participant in the match
 */
export interface ParticipantDTO {
    /** Player's unique PUUID */
    puuid: string;
    /** Player's encrypted Summoner ID */
    summonerId: string;
    /** Player's name at the time of the match */
    summonerName: string;
    /** Player's level at the time of the match */
    summonerLevel: number;
    /** ID of the champion played */
    championId: number;
    /** Name of the champion played */
    championName: string;
    /** Team ID (100 for Blue, 200 for Red) */
    teamId: number;
    /** Indicates if the participant won the match */
    win: boolean;
    
    // Combat Stats
    /** Total kills achieved by the player */
    kills: number;
    /** Total deaths of the player */
    deaths: number;
    /** Total assists provided by the player */
    assists: number;
    /** Total damage dealt to enemy champions */
    totalDamageDealtToChampions: number;
    /** Total damage taken by the player */
    totalDamageTaken: number;
    /** Total gold earned during the match */
    goldEarned: number;
    
    // Position
    /** Best guess for the position played (e.g., "TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY") */
    individualPosition: string;
    /** Computed position based on team composition */
    teamPosition: string;

    // Items
    item0: number;
    item1: number;
    item2: number;
    item3: number;
    item4: number;
    item5: number;
    item6: number;

    /** Dynamic record of player challenges and achievements */
    challenges?: Record<string, number | boolean>;
}

/**
 * Statistics for a team (Blue or Red)
 */
export interface TeamDTO {
    /** Team ID (100 for Blue, 200 for Red) */
    teamId: number;
    /** Indicates if the team won the match */
    win: boolean;
    /** List of champion bans made by the team */
    bans: BanDTO[];
    /** Team objectives like Baron, Dragon, and Turrets */
    objectives: ObjectivesDTO;
}

/**
 * Champion ban information
 */
export interface BanDTO {
    /** ID of the banned champion */
    championId: number;
    /** The turn number when this ban was made */
    pickTurn: number;
}

/**
 * Team objectives status
 */
export interface ObjectivesDTO {
    baron: ObjectiveDTO;
    champion: ObjectiveDTO;
    dragon: ObjectiveDTO;
    inhibitor: ObjectiveDTO;
    riftHerald: ObjectiveDTO;
    tower: ObjectiveDTO;
}

/**
 * Status of a specific objective
 */
export interface ObjectiveDTO {
    /** Indicates if the team secured the first kill of this objective type */
    first: boolean;
    /** Total number of times the team killed this objective */
    kills: number;
}