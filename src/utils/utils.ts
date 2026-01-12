import { RiotPlatform, RiotRegion } from 'src/types/common';

export const RIOT_PLATFORMS: RiotPlatform[] = [
    'br1', 'eun1', 'euw1', 'jp1', 'kr', 'la1', 'la2', 'na1', 'oc1', 'tr1', 'ru', 'ph2', 'sg2', 'th2', 'tw2', 'vn2'
];

export const isPlatform = (loc: string): loc is RiotPlatform => {
    return RIOT_PLATFORMS.includes(loc as RiotPlatform);
};

/**
 * Helper method to return Region from Platform
 * E.g. 'euw1' -> 'europe'
 * @param platform RiotPlatform
 * @returns RiotRegion
 */
export const getRegionFromPlatform = (platform: RiotPlatform): RiotRegion => {
    const mapping: Record<RiotPlatform, RiotRegion> = {
        euw1: 'europe', eun1: 'europe', tr1: 'europe', ru: 'europe',
        na1: 'americas', br1: 'americas', la1: 'americas', la2: 'americas',
        kr: 'asia', jp1: 'asia',
        ph2: 'sea', sg2: 'sea', th2: 'sea', tw2: 'sea', vn2: 'sea', oc1: 'sea'
    };
    return mapping[platform] || 'europe';
};