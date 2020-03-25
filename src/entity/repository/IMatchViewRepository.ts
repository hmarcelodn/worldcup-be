import { Match } from "../Match";
import { MatchView } from "../MatchView";

export interface IMatchViewRepository{
    getSortedByDateMatch(): Promise<Array<MatchView>>;
    getMatchViewByGuid(guid: string): Promise<MatchView>;
}