// TypeORM
import { Repository, EntityRepository } from "typeorm";

// Local deps
import { Fixture } from "../entity/Fixture";
import { IFixtureRepository } from "../entity/repository/IFixtureRepository";

@EntityRepository(Fixture)
export class FixtureRepository extends Repository<Fixture> implements IFixtureRepository{
    public async getFixtureByHomeVictory(matchGuid: string): Promise<Fixture[]> {
        return this.createQueryBuilder("fixture")
                   .where("fixture.homeGoalsBet > fixture.awayGoalsBet")
                   .andWhere("fixture.matchGuid = :guid", { guid:  matchGuid})
                   .getMany();
    }
    
    public async getFixtureByAwayVictory(matchGuid: string): Promise<Fixture[]> {
        return this.createQueryBuilder("fixture")
                   .where("fixture.homeGoalsBet < fixture.awayGoalsBet")
                   .andWhere("fixture.matchGuid = :guid", { guid:  matchGuid})
                   .getMany();
    }
    
    public async getFixtureByDraw(matchGuid: string): Promise<Fixture[]> {
        return this.createQueryBuilder("fixture")
                   .where("fixture.homeGoalsBet = fixture.awayGoalsBet")
                   .andWhere("fixture.matchGuid = :guid", { guid:  matchGuid})
                   .getMany();
    }

    public async getFixtureByGroupGuid(guid : string): Promise<Array<Fixture>> {                
        return this.createQueryBuilder("fixture")
                   .where("fixture.groupGuid = :guid", { guid: guid })
                   .getMany();
    }

    public async getTotal(): Promise<number>{
        return this.createQueryBuilder("fixture")
                         .getCount();    
    }

    public async getFixtureByGroupBetUserMatch(groupGuid: string, userGuid: string, matchGuid?: string): Promise<Array<Fixture>> {
        let query = this.createQueryBuilder("fixture")
                   .where("fixture.groupGuid = :groupGuid", { groupGuid: groupGuid })
                   .andWhere("fixture.userGuid = :userGuid", { userGuid: userGuid });
        
        if(matchGuid){
            query.andWhere("fixture.matchGuid = :matchGuid", { matchGuid: matchGuid })
        }
                   
        query.select("fixture.homeGoalsBet")
             .addSelect("fixture.id")
             .addSelect("fixture.awayGoalsBet")
             .addSelect("fixture.guid")
             .addSelect("fixture.groupGuid")
             .addSelect("fixture.matchGuid")
             .addSelect("fixture.userGuid")
             .getOne();

        return await query.getMany();
    }
}