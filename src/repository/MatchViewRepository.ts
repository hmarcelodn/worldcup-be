// TypeORM
import { Service } from "typedi";
import { EntityRepository, Repository } from "typeorm";
import * as moment from "moment";
import * as R from "ramda";

// Local Deps
import { IMatchViewRepository } from "../entity/repository/IMatchViewRepository";
import { MatchView } from "../entity/MatchView";

@Service()
@EntityRepository(MatchView)
export class MatchViewRepository extends Repository<MatchView> implements IMatchViewRepository{
    public async getMatchViewByGuid(guid: string): Promise<MatchView> {
        return await this.createQueryBuilder("matchView")
                         .where("matchView.guid = :guid", { guid: guid })
                         .getOne();
    }                   
    
    public async getSortedByDateMatch(): Promise<Array<MatchView>> {    
        return await this.createQueryBuilder("matchView")
            .orderBy('matchView.matchDate', 'ASC')
            .select("matchView.matchDate")
            .addSelect("matchView.homeTeamName")
            .addSelect("matchView.homeTeamGuid")
            .addSelect("matchView.awayTeamName")
            .addSelect("matchView.awayTeamGuid")
            .addSelect("matchView.groupName")
            .addSelect("matchView.groupGuid")
            .addSelect("matchView.stadiumName")
            .addSelect("matchView.stadiumCity")
            .addSelect("matchView.stadiumGuid")
            .addSelect("matchView.guid")
            .addSelect("matchView.homeGoals")
            .addSelect("matchView.awayGoals")
            .addSelect("matchView.home")
            .addSelect("matchView.away")
            .addSelect("matchView.draw")
            .addSelect("matchView.homeFlag")
            .addSelect("matchView.awayFlag")
            .addSelect("matchView.homeIso2")
            .addSelect("matchView.awayIso2")
            .addSelect("matchView.homeFifaCode")
            .addSelect("matchView.awayFifaCode") 
            .addSelect("matchView.isFinished")
            .addSelect("matchView.homePercent")
            .addSelect("matchView.awayPercent")
            .addSelect("matchView.drawPercent")
            .addSelect("matchView.video")            
            .getMany();
    }    

    public async getNextMatches(): Promise<Array<MatchView>> {
        const days = await this.createQueryBuilder("matchView")
            .where("matchView.homeGoals IS NULL")
            .andWhere("matchView.awayGoals IS NULL")
            .orderBy('matchView.matchDate', 'ASC')
            .select("matchView.matchDate")
            .groupBy("matchView.matchDate")
            .getRawMany();       

        let groupDays = new Array<any>();

        days.forEach((day) => {
            groupDays.push(
                moment(day.matchView_matchDate).startOf('day').toDate()
            );
        });

        let diff = (a, b) => { return a - b; };
        let sortDays = R.sort(diff, groupDays);
        let uniqueDays = R.uniq(sortDays);
        let nextDay = moment(R.nth(0, uniqueDays)).startOf('day').format("YYYY-MM-DD") ;
        
        let matches = await this.createQueryBuilder("matchView")
            .where("matchView.homeGoals IS NULL")
            .andWhere("matchView.awayGoals IS NULL")          
            .orderBy('matchView.matchDate', 'ASC')
            .select("matchView.matchDate")
            .addSelect("matchView.homeTeamName")
            .addSelect("matchView.awayTeamName")
            .addSelect("matchView.stadiumName")
            .addSelect("matchView.stadiumCity")
            .addSelect("matchView.guid")
            .addSelect("matchView.homeFlag")
            .addSelect("matchView.awayFlag")
            .addSelect("matchView.homeIso2")
            .addSelect("matchView.awayIso2")    
            .addSelect("matchView.homeFifaCode")
            .addSelect("matchView.awayFifaCode")                        
            .getMany();

        let matchesDay = new Array<MatchView>()
        
        matches.forEach((m) => {
            if(moment(m.matchDate).startOf('day').format("YYYY-MM-DD") == nextDay){
                matchesDay.push(m);
            }
        });

        return Promise.resolve(matchesDay);
    }  

    public async all(): Promise<Array<MatchView>>{
        return await this.find();
    }
}