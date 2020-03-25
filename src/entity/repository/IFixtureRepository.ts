import { Fixture } from "../Fixture";

export interface IFixtureRepository{
    getFixtureByGroupGuid(guid: string): Promise<Array<Fixture>>;
    getFixtureByGroupBetUserMatch(groupGuid: string, userGuid: string, matchGuid?: string): Promise<Array<Fixture>>;
    getFixtureByHomeVictory(matchGuid: string): Promise<Array<Fixture>>;
    getFixtureByAwayVictory(matchGuid: string): Promise<Array<Fixture>>;
    getFixtureByDraw(matchGuid: string): Promise<Array<Fixture>>;    
}