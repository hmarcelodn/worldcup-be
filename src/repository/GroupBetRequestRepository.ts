// TypeORM
import { Service } from "typedi";
import { EntityRepository, Repository } from "typeorm";

// Local Deps
import { IGroupBetRequestRepository } from "../entity/repository/IGroupBetRequestRepository";
import { GroupBetRequest } from "../entity/GroupBetRequest";
import { GroupBetRequestStatusEnum } from "../entity/enums/GroupBetRequestStatusEnum";

@Service()
@EntityRepository(GroupBetRequest)
export class GroupBetRequestRepository extends Repository<GroupBetRequest> implements IGroupBetRequestRepository {
    public async getRequestByUserAndGroup(userGuid: string, groupBetGuid: string): Promise<GroupBetRequest> {
        return await this.createQueryBuilder("request")
                         .innerJoinAndSelect("request.requestor", "requestor")
                         .innerJoinAndSelect("request.approver", "approver")
                         .innerJoinAndSelect("request.requestGroup", "requestGroup")
                         .where("requestor.guid = :userGuid", { userGuid: userGuid })
                         .andWhere("requestGroup.guid = :groupBetGuid", { groupBetGuid: groupBetGuid })
                         .getOne();
    }    

    public async getRequestByGuid(reqGuid: string): Promise<GroupBetRequest> {
        return await this.createQueryBuilder("request")
                        .innerJoinAndSelect("request.requestor", "requestor")
                        .innerJoinAndSelect("request.approver", "approver")
                        .innerJoinAndSelect("request.requestGroup", "requestGroup")        
                        .where("request.guid = :reqGuid", { reqGuid: reqGuid })
                        .getOne();
    }       
    
    public async getRejected(approverManagerGuid: string): Promise<Array<GroupBetRequest>> {
        return await this.createQueryBuilder("request")
                         .innerJoinAndSelect("request.requestor", "requestor")
                         .innerJoinAndSelect("request.approver", "approver")
                         .innerJoinAndSelect("request.requestGroup", "requestGroup")        
                         .where("approver.guid = :managerGuid", { managerGuid: approverManagerGuid })
                         .andWhere("request.status = :status", { status: GroupBetRequestStatusEnum.REJECTED })
                        //  .select("request.status")
                        //  .addSelect("requestor.emailAddress")
                        //  .addSelect("requestor.picture")
                        //  .addSelect("requestGroup.name")
                        //  .addSelect("request.guid")  
                         .getMany();
    }
    
    public async getApproved(approverManagerGuid: string): Promise<Array<GroupBetRequest>> {
        return await this.createQueryBuilder("request")
                         .innerJoinAndSelect("request.requestor", "requestor")
                         .innerJoinAndSelect("request.approver", "approver")
                         .innerJoinAndSelect("request.requestGroup", "requestGroup")         
                         .where("approver.guid = :managerGuid", { managerGuid: approverManagerGuid })
                         .andWhere("request.status = :status", { status: GroupBetRequestStatusEnum.APPROVED })
                        //  .select("request.status")
                        //  .addSelect("requestor.emailAddress")
                        //  .addSelect("requestor.picture")
                        //  .addSelect("requestGroup.name")
                        //  .addSelect("request.guid")                         
                         .getMany();
    }

    public async getWaiting(approverManagerGuid: string): Promise<Array<GroupBetRequest>> {
        return await this.createQueryBuilder("request")
                         .innerJoinAndSelect("request.requestor", "requestor")
                         .innerJoinAndSelect("request.approver", "approver")
                         .innerJoinAndSelect("request.requestGroup", "requestGroup")         
                         .where("approver.guid = :managerGuid", { managerGuid: approverManagerGuid })
                         .andWhere("request.status = :status", { status: GroupBetRequestStatusEnum.WAITING })
                        //  .select("request.status")
                        //  .addSelect("requestor.emailAddress")
                        //  .addSelect("requestor.picture")
                        //  .addSelect("requestGroup.name")
                        //  .addSelect("request.guid")                         
                         .getMany();
    }    
}