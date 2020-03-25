// LocalDeps
import { GroupBetManager } from "../GroupBetManager";

export interface IGroupManagerRepository{
    getManagerByGroupGuid(guid: string): Promise<GroupBetManager>;
}