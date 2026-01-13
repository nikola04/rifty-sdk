import { MatchFilters } from "./match.dto";
import { RiotMatch } from "./match.entity";

/**
 * A wrapper class for handling multiple RiotMatch instances.
 * Provides utility methods for bulk fetching, filtering, and basic analytics.
 */
export class MatchCollection implements Iterable<RiotMatch> {
    private items: RiotMatch[];

    /**
     * Metadata about the query used to fetch this collection (pagination, filters, etc.)
     */
    public readonly meta: MatchFilters | null;

    /**
     * @param items - An array of RiotMatch entities to wrap in the collection.
     * @param filters - An MatchFilter object used to get matches array
     */
    constructor(items: RiotMatch[], filters?: MatchFilters) {
        this.items = items;
        this.meta = filters ?? null;
    }

    /**
     * Calculates the winrate percentage of the matches in this collection.
     * Note: Only considers matches that have been fetched.
     * * @returns The winrate as a decimal (e.g., 0.55 for 55%) or 0 if no matches are fetched.
     */
    public getWinrate(): number {
        const fetched = this.items.filter(m => m.isFetched);
        if (fetched.length === 0) return 0;

        let wins = 0;
        for (const match of fetched) {
            const myStats = match.getMe();
            if (myStats?.win) wins++;
        }

        return wins / fetched.length;
    }

    /**
     * Hydrates all unfetched matches in the collection by calling the API.
     * Implements a concurrency limit to prevent hitting rate limits too aggressively.
     * @param options.force - If true, re-fetches even already cached/fetched matches.
     * @param options.concurrency - The number of simultaneous API requests allowed (default: 3).
     * @returns A promise that resolves once all targeted matches are fetched.
     */
    public async fetchAll(options = { force: false, concurrency: 3 }): Promise<void> {
        const unfetched = this.items.filter(m => options.force || !m.isFetched);

        for (let i = 0; i < unfetched.length; i += options.concurrency) {
            const batch = unfetched.slice(i, i + options.concurrency);
            await Promise.all(batch.map(match => match.fetch(options)));
        }
    }

    /**
     * Searches for a specific match by its unique match ID.
     * * @param matchId - The unique Riot match identifier (e.g., "EUW1_12345678").
     * @returns The RiotMatch instance if found, otherwise undefined.
     */
    public find(matchId: string): RiotMatch | undefined {
        return this.items.find(m => m.matchId === matchId);
    }

    /**
     * Retrieves a match by its index position in the collection.
     * * @param position - The array index (starts at 0).
     * @returns The RiotMatch instance at the given position, or undefined if out of bounds.
     */
    public get(position: number): RiotMatch | undefined {
        if (position < 0 || position >= this.count) return undefined;
        return this.items[position];
    }

    /**
     * Releases heavy match data (DTOs) from all matches in the collection to free up memory.
     * The RiotMatch entities remain, but their .info properties will be null until re-fetched.
     */
    public unloadAll(): void {
        this.items.forEach(m => m.unload());
    }

    /**
     * The total number of matches currently held in the collection.
     */
    get count(): number {
        return this.items.length;
    }

    /**
     * Converts the collection back into a standard JavaScript array of RiotMatch entities.
     * Useful for using native array methods not provided by this collection.
     * * @returns A shallow copy of the underlying items array.
     */
    public toArray(): RiotMatch[] {
        return [...this.items];
    }

    /**
     * Built-in iterator that allows the collection to be used in for...of loops.
     */
    [Symbol.iterator]() {
        return this.items[Symbol.iterator]();
    }

    /**
     * Transforms each match in the collection into a new value.
     * * @param callback - Function to execute for each match.
     * @returns An array containing the results of the callback function.
     */
    public map<T>(callback: (match: RiotMatch, index: number) => T): T[] {
        return this.items.map(callback);
    }

    /**
     * Filters the collection based on a predicate and returns a NEW MatchCollection.
     * * @param predicate - Function that returns true to keep the match.
     * @returns A new MatchCollection instance containing the filtered matches.
     */
    public filter(predicate: (match: RiotMatch) => boolean): MatchCollection {
        return new MatchCollection(this.items.filter(predicate));
    }
}
