import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RiftySDK } from '@rifty';
import { RiotAccount } from './account.entity';

describe('AccountAPI (Unit)', () => {
    let sdk: RiftySDK;

    beforeEach(() => {
        sdk = new RiftySDK({ apiKey: 'test-key' });
        vi.clearAllMocks();
    });

    it('should fetch account and return a RiotAccount instance with metadata', async () => {
        const mockData = {
            puuid: 'test-puuid-123',
            gameName: 'Faker',
            tagLine: 'KR1'
        };

        const mockWrapper = {
            data: mockData,
            updatedAt: Date.now()
        };

        const requestSpy = vi.spyOn(sdk.account as any, 'request').mockResolvedValue(mockWrapper);

        const result = await sdk.account.getByGameNameAndTag('asia', 'Faker', 'KR1');

        expect(requestSpy).toHaveBeenCalledWith(
            'asia', 
            expect.stringContaining('by-riot-id/Faker/KR1'),
            3600,
            false
        );

        expect(result).toBeInstanceOf(RiotAccount);
        expect(result.fullId).toBe('Faker#KR1');
        expect(result.lastFetched).toBeDefined();
    });

    it('should pass force flag when sync/refresh is requested', async () => {
        const mockWrapper = { data: {}, updatedAt: Date.now() };
        const requestSpy = vi.spyOn(sdk.account as any, 'request').mockResolvedValue(mockWrapper);

        await sdk.account.getByGameNameAndTag('americas', 'Faker', 'KR1', { force: true });

        expect(requestSpy).toHaveBeenCalledWith(
            'americas',
            expect.any(String),
            expect.any(Number),
            true
        );
    });

    it('should handle URI encoding for special characters', async () => {
        const mockWrapper = { data: {}, updatedAt: Date.now() };
        const requestSpy = vi.spyOn(sdk.account as any, 'request').mockResolvedValue(mockWrapper);
        
        await sdk.account.getByGameNameAndTag('europe', 'Name With Space', 'TAG');

        // Provera da li je space pretvoren u %20
        expect(requestSpy).toHaveBeenCalledWith(
            'europe', 
            expect.stringContaining('Name%20With%20Space'),
            expect.any(Number),
            expect.any(Boolean)
        );
    });
});