import { GroupBet } from "../GroupBet";

export interface IGroupBetRepository{
    getUserGroupBetByName(name: string): Promise<GroupBet>;
    getUserGroupBetByUUID(uuid: string): Promise<GroupBet>; 
    getUserGroupBets(): Promise<Array<GroupBet>>;
}