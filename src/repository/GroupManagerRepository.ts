// TypeORM
import { Service } from "typedi";
import { EntityRepository, Repository } from "typeorm";

// LocalDeps
import { IGroupManagerRepository } from "../entity/repository/IGroupManagerRepository";
import { GroupBetManager } from "../entity/GroupBetManager";

@Service()
@EntityRepository(GroupBetManager)
export class GroupManagerRepository extends Repository<GroupBetManager> implements IGroupManagerRepository{

    public async getManagerByGroupGuid(guid: string): Promise<GroupBetManager> {
        return await this.createQueryBuilder("groupBetManager")
                   .innerJoinAndSelect("groupBetManager.userManager", "userManager")
                   .innerJoinAndSelect("groupBetManager.managingGroupBet", "managingGroupBet")
                   .where("managingGroupBet.guid = :groupGuid", { groupGuid: guid })
                   .getOne();
    }
    
}