// TypeOrm
import { getRepository, getCustomRepository } from "typeorm";
import { Inject, Service } from "typedi";
import * as _ from "lodash";
import * as R from "ramda";

// Local Deps
import { FixtureService } from "./FixtureService";
import { Fixture } from "../entity/Fixture";
import { MatchViewRepository } from "../repository/MatchViewRepository";
import { MatchView } from "../entity/MatchView";
import { RankingModel } from "../model/RankingModel";
import { ScoreRepository } from "../repository/ScoreRepository";
import { Score } from "../entity/Score";
import { GroupBetRepository } from "../repository/GroupBetRepository";
import { User } from "../entity/User";

@Service()
export class RankingService{

    @Inject()
    fixtureService: FixtureService;

    public async computeRanking(groupGuid: string): Promise<any>{
        const fixture = await this.fixtureService.getFixtureByGroupGuid(groupGuid);
        const matchesViewRepo = getCustomRepository(MatchViewRepository);
        const matches = await matchesViewRepo.find();
        
        let userGuids = new Object();
    
        // Assets fixture group
        fixture.forEach((f) => {
            if(!(f.userGuid in userGuids)){
                let newRank = new RankingModel();
                newRank.picture = f.picture;
                newRank.score = "0";
                newRank.username = f.userName;
                
                userGuids[f.userGuid] = newRank;
            }

            let rankingModel: RankingModel = userGuids[f.userGuid];
            const mv: MatchView = this.getMatch(matches, f.matchGuid);            

            // Asserts Result
            if(
                (mv.awayGoals == f.awayGoalsBet) && (mv.homeGoals == f.homeGoalsBet)
            ){
                // Sum home bwins
                if(mv.homeGoals > mv.awayGoals){
                    rankingModel.score += parseInt(mv.home);
                }
                // Sum away bwins
                else if(mv.homeGoals < mv.awayGoals){
                    rankingModel.score += parseInt(mv.away);
                }
                // Sum draw bwins
                else{
                    rankingModel.score += parseInt(mv.draw);
                }
            }

            userGuids[f.userGuid] = rankingModel;
        });

        // List
        let arr = new Array<RankingModel>();
        Object.keys(userGuids).forEach(function (key) { 
            arr.push(userGuids[key]);
        });        

        // Sort & Rank Ramda
        const scoreSort = R.sortWith([
            R.descend(R.prop('score'))
        ]);        

        return Promise.resolve(scoreSort(arr));        
    }

    private getMatch(matches:Array<MatchView>, guid: string): MatchView{
        return  _.find(matches, (m: MatchView) => {
            return m.guid == guid;
        });
    }

    public async getScores(groupGuid: string, user: User): Promise<any>{
        const scoreRepo = getCustomRepository(ScoreRepository);
        const groupBetRepo = getCustomRepository(GroupBetRepository);
        const groupBet = await groupBetRepo.getUserGroupBetByUUID(groupGuid);

        if(!groupBet){
            return Promise.reject("El grupo no existe.");
        }

        if(groupBet.items !== undefined){
            if(R.find(R.propEq('userGuid', user.guid))(groupBet.items) === undefined){
                return Promise.reject("El usuario no pertenece a este grupo.");
            }  
        }   

        const scores = await scoreRepo.getScoreByGroupGuid(groupGuid);

        let rankingArr = new Array<RankingModel>();
        const mapScore = (score: Score) => { 
            let model = new RankingModel();
            model.picture = score.user.picture;
            model.score = parseFloat(score.points).toFixed(2);
            model.username = score.user.getFullName();
            rankingArr.push(model);
        }

        // Ramda Each
        R.forEach(mapScore, scores);

        const sortedRankingArr = rankingArr.sort((a, b) => {
            return parseFloat(b.score) - parseFloat(a.score);
        });
        
        return Promise.resolve(sortedRankingArr);
    }
}