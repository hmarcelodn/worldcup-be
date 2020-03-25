// TypeORM
import { Repository, EntityRepository } from "typeorm";
import { Service } from "typedi";

// LocalDeps
import { IScoreRepository } from "../entity/repository/IScoreRepository";
import { Score } from "../entity/Score";

@Service()
@EntityRepository(Score)
export class ScoreRepository extends Repository<Score> implements IScoreRepository{
    
    public async getScoreByUserAndGroup(userGuid: string, groupGuid: string): Promise<Score> {
        return await this.createQueryBuilder("score")
                         .innerJoinAndSelect("score.user", "user")   
                         .innerJoinAndSelect("score.group", "group")                         
                         .where("user.guid = :userGuid", { userGuid: userGuid })
                         .andWhere("group.guid = :groupGuid", { groupGuid: groupGuid })
                         .getOne();
    }

    public async getScoreByGroupGuid(groupGuid: string): Promise<Array<Score>> {
        return await this.createQueryBuilder("score")
                         .innerJoinAndSelect("score.user", "user") 
                         .innerJoinAndSelect("score.group", "group")  
                         .where("group.guid = :groupGuid", { groupGuid: groupGuid })
                         .getMany();
    }    
    
}