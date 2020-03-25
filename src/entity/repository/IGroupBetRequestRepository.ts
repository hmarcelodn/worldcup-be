// LocalDeps
import { GroupBetRequest } from "../GroupBetRequest";

export interface IGroupBetRequestRepository{
    getRequestByUserAndGroup(userGuid: string, groupBetGuid: string): Promise<GroupBetRequest>;
    getRejected(approverManagerGuid: string): Promise<Array<GroupBetRequest>>;
    getApproved(approverManagerGuid: string): Promise<Array<GroupBetRequest>>;
    getWaiting(approverManagerGuid: string): Promise<Array<GroupBetRequest>>;
}