import { Score } from "../Score";

export interface IScoreRepository{
    getScoreByUserAndGroup(userGuid: string, groupGuid: string): Promise<Score>;

    getScoreByGroupGuid(groupGuid: string): Promise<Array<Score>>;
}