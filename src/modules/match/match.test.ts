import { beforeEach, describe, expect, it, vi } from "vitest";

import { MatchCollection } from "./match.collection";
import { MatchDTO, ParticipantDTO } from "./match.dto";
import { RiotMatch } from "./match.entity";

const mockSDK = {
    match: {
        getById: vi.fn(),
    },
} as any;

const mockSummoner = {
    puuid: "p-123",
    platform: "euw1",
} as any;

/**
 * Helper to create a dummy MatchDTO
 */
const createMockDTO = (matchId: string, win: boolean): MatchDTO => ({
    metadata: {
        matchId,
        dataVersion: "2",
        participants: ["p-123", "p-456"],
    },
    info: {
        gameId: 123,
        participants: [
            { puuid: "p-123", win: win, kills: 5, deaths: 0 } as ParticipantDTO,
            { puuid: "p-456", win: !win, kills: 0, deaths: 5 } as ParticipantDTO,
        ],
    } as any,
});

describe("Match Module (Unit)", () => {
    describe("RiotMatch Entity", () => {
        it("should initialize with provided data", () => {
            const data = createMockDTO("EUW_1", true);
            const match = new RiotMatch(mockSDK, "EUW_1", { summoner: mockSummoner }, data);

            expect(match.matchId).toBe("EUW_1");
            expect(match.isFetched).toBe(true);
            expect(match.info).not.toBeNull();
        });

        it("should return correct participant data via getMe()", () => {
            const data = createMockDTO("EUW_1", true);
            const match = new RiotMatch(mockSDK, "EUW_1", { summoner: mockSummoner }, data);

            const me = match.getMe();
            expect(me).not.toBeNull();
            expect(me?.puuid).toBe("p-123");
            expect(me?.win).toBe(true);
        });

        it("should clear data when unload() is called", () => {
            const data = createMockDTO("EUW_1", true);
            const match = new RiotMatch(mockSDK, "EUW_1", { summoner: mockSummoner }, data);

            match.unload();
            expect(match.isFetched).toBe(false);
            expect(match.info).toBeNull();
        });

        it("should throw error if context is invalid", () => {
            expect(() => new RiotMatch(mockSDK, "ID", {} as any)).toThrow();
        });
    });

    describe("MatchCollection", () => {
        let matches: RiotMatch[];

        beforeEach(() => {
            // Setup 4 matches: 3 wins, 1 loss
            matches = [
                new RiotMatch(mockSDK, "M1", { summoner: mockSummoner }, createMockDTO("M1", true)),
                new RiotMatch(mockSDK, "M2", { summoner: mockSummoner }, createMockDTO("M2", true)),
                new RiotMatch(mockSDK, "M3", { summoner: mockSummoner }, createMockDTO("M3", true)),
                new RiotMatch(mockSDK, "M4", { summoner: mockSummoner }, createMockDTO("M4", false)),
            ];
        });

        it("should calculate winrate correctly (75%)", () => {
            const collection = new MatchCollection(matches);
            expect(collection.getWinrate()).toBe(0.75);
        });

        it("should return 0 winrate if no matches are fetched", () => {
            const unfetchedMatches = [new RiotMatch(mockSDK, "M1", { summoner: mockSummoner })];
            const collection = new MatchCollection(unfetchedMatches);
            expect(collection.getWinrate()).toBe(0);
        });

        it("should store metadata (filters) correctly", () => {
            const filters = { start: 0, count: 20, queue: 420 };
            const collection = new MatchCollection(matches, filters);

            expect(collection.meta).not.toBeNull();
            expect(collection.meta?.queue).toBe(420);
        });

        it("should filter matches and return a NEW MatchCollection", () => {
            const collection = new MatchCollection(matches);
            const onlyM1 = collection.filter(m => m.matchId === "M1");

            expect(onlyM1).toBeInstanceOf(MatchCollection);
            expect(onlyM1.count).toBe(1);
            expect(onlyM1.get(0)?.matchId).toBe("M1");
        });

        it("should be iterable in for...of loops", () => {
            const collection = new MatchCollection(matches);
            const ids: string[] = [];
            for (const m of collection) {
                ids.push(m.matchId);
            }
            expect(ids).toEqual(["M1", "M2", "M3", "M4"]);
        });

        it("should handle fetchAll with concurrency", async () => {
            const unfetched = [
                new RiotMatch(mockSDK, "U1", { summoner: mockSummoner }),
                new RiotMatch(mockSDK, "U2", { summoner: mockSummoner }),
            ];

            // Mocking the fetch internal call
            mockSDK.match.getById.mockResolvedValue({ _data: createMockDTO("U1", true) });

            const collection = new MatchCollection(unfetched);
            await collection.fetchAll({ concurrency: 2, force: false });

            expect(mockSDK.match.getById).toHaveBeenCalledTimes(2);
        });
    });
});
