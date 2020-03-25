// TypeORM
import { Service } from "typedi";
import { getCustomRepository } from "typeorm";
import * as R from "ramda";

// LocalDeps
import { GroupRepository } from "../repository/GroupRepository";
import { MatchViewRepository } from "../repository/MatchViewRepository";
import { ScoreRepository } from "../repository/ScoreRepository";
import { FixtureRepository } from "../repository/FixtureRepository";
import { Fixture } from "../entity/Fixture";

@Service()
export class MatchScoreService{

    // public async SaveAndComputeMatch(matchGuid: string, matchViewGuid, away: number, home: number, io: any): Promise<void>{
    //     const groupRepo = getCustomRepository(GroupRepository);
    //     const matchViewRepo = getCustomRepository(MatchViewRepository);
        
    //     // Update Matches
    //     let group = await groupRepo.getGroupByMatch(matchGuid);        
    //     group.matches.forEach(async (match) => {
    //         if(match.guid === matchGuid){
    //             match.away_result = away.toString();
    //             match.home_result = home.toString();
    //             match.finished = true;
    //         }
    //     }); 

    //     await groupRepo.save(group);

    //     // Update View Matchs
    //     let matchView = await matchViewRepo.getMatchViewByGuid(matchViewGuid);
    //     matchView.homeGoals = home;
    //     matchView.awayGoals = away;

    //     await matchViewRepo.save(matchView);

    //     io.emit("matchFinished", {
    //         matchGuid: matchGuid,
    //         home: home,
    //         away: away
    //     });
    // }

    public async saveAndComputeMatchWithoutSocket(matchViewGuid: string, away: number, home: number, video: string): Promise<void>{
        // Repo
        const matchViewRepo = getCustomRepository(MatchViewRepository);

        // Update View Matchs
        let matchView = await matchViewRepo.getMatchViewByGuid(matchViewGuid);
        matchView.homeGoals = home;
        matchView.awayGoals = away;

        // Highlights
        if(video){
            matchView.video = video;            
        }

        // Save
        await matchViewRepo.save(matchView);
    }    

    public async computeScore(matchViewGuid: string): Promise<void>{
        const scoreRepo = getCustomRepository(ScoreRepository);
        const matchViewRepo = getCustomRepository(MatchViewRepository);
        const fixtureRepo = getCustomRepository(FixtureRepository);

        const matchView = await matchViewRepo.getMatchViewByGuid(matchViewGuid);
        let fixtures = null;
        let bwin = 0;

        if(matchView.homeGoals > matchView.awayGoals){
            fixtures = await fixtureRepo.getFixtureByHomeVictory(matchView.guid);
            bwin = parseFloat(matchView.home);
        }
        else if(matchView.homeGoals < matchView.awayGoals){
            fixtures = await fixtureRepo.getFixtureByAwayVictory(matchView.guid);
            bwin = parseFloat(matchView.away);
        }
        else{
            fixtures = await fixtureRepo.getFixtureByDraw(matchView.guid);
            bwin = parseFloat(matchView.draw);
        }

        console.log("Processing %s fixtures", fixtures.length);

        // Calc score
        const computeFixture = async (fixture: Fixture) => {

            console.log("Processing user: ", fixture.userName);

            let score = await scoreRepo.getScoreByUserAndGroup(fixture.userGuid, fixture.groupGuid);

            // Bwin sum
            score.points = (parseFloat(score.points) + bwin).toString();

            // Exact match extra sum
            if( 
                (fixture.awayGoalsBet === matchView.awayGoals) && 
                (fixture.homeGoalsBet === matchView.homeGoals)
            ){
                score.points = (parseFloat(score.points) + 2).toString();
            }

            await scoreRepo.save(score);
        };

        // Go over the fixtures
        R.forEach(computeFixture, fixtures);

        return Promise.resolve();
    }    
}