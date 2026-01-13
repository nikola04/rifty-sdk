// Copyright (c) 2026 Nikola Nedeljkovic
// Licensed under the GNU GPLv3 License.
import { AccountAPI } from "@modules/account/account.api";
import { MatchAPI } from "@modules/match/match.api";
import { SummonerAPI } from "@modules/summoner/summoner.api";

import { RiftyConfig } from "./core/base";

export class RiftySDK {
    public readonly account: AccountAPI;
    public readonly summoner: SummonerAPI;
    public readonly match: MatchAPI;

    constructor(public readonly config: RiftyConfig) {
        this.account = new AccountAPI(this.config, this);
        this.summoner = new SummonerAPI(this.config, this);
        this.match = new MatchAPI(this.config, this);
    }
}

export * from "@shared/types/common";
export { isPlatform, getRegionFromPlatform } from "@shared/utils/utils";

export * from "@modules/account";
export * from "@modules/summoner";
