// TypeORM
import { Service } from "typedi";
import { EntityRepository, Repository } from "typeorm";

// Local Deps
import { Group } from "../entity/Group";
import { IGroupRepository } from "../entity/repository/IGroupRepository";

@Service()
@EntityRepository(Group)
export class GroupRepository extends Repository<Group> implements IGroupRepository{
    public async getGroups(): Promise<Array<Group>> {        
        let groups = await this.createQueryBuilder("group")
        .leftJoinAndSelect("group.matches", "match")
        .getMany()
        
        return groups;
    }

    public async getGroupByMatch(matchGuid: string){
        let groups = await this.createQueryBuilder("group")
        .leftJoinAndSelect("group.matches", "match")
        .where("match.guid = :guid ", { guid: matchGuid })
        .getOne();
        
        return groups;        
    }

}