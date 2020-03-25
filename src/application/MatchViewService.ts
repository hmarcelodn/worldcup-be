// TypeOrm
import { getCustomRepository } from "typeorm";
import { Service } from "typedi";
import * as uuid from "uuid/v4";
import * as _ from "lodash";

// Local Deps
import { GroupRepository } from "../repository/GroupRepository";
import { TeamRepository } from "../repository/TeamRepository";
import { MatchViewRepository } from "../repository/MatchViewRepository";
import { StadiumRepository } from "../repository/StadiumRepository";
import { Group } from "../entity/Group";
import { Team } from "../entity/Team";
import { Stadium } from "../entity/Stadium";
import { MatchView } from "../entity/MatchView";

@Service()
export class MatchViewService{
    
    // Create a simple view for start screen to cache
    public async createMatchView(){
        const groupRepo = getCustomRepository(GroupRepository);
        const teamRepo = getCustomRepository(TeamRepository);
        const stadiumRepo = getCustomRepository(StadiumRepository);
        const viewRepo = getCustomRepository(MatchViewRepository);
    
        let groups: Array<Group> = await groupRepo.getGroups();
        let teams: Array<Team> = await teamRepo.find();
        let stadiums: Array<Stadium> = await stadiumRepo.find();
    
        // Group Matches
        groups.forEach(async (g) => {
            g.matches.forEach(async (m) => {
                let view = new MatchView();
    
                let homeTeam: Team = this.getTeam(teams, m.home_team);
                let awayTeam: Team = this.getTeam(teams, m.away_team);
                let stadium: Stadium = this.getStadium(stadiums, m.stadium);
    
                view.homeTeamGuid = homeTeam.guid;
                view.homeTeamName = homeTeam.name;                
                view.awayTeamGuid = awayTeam.guid;
                view.awayTeamName = awayTeam.name;
                view.stadiumName = stadium.name;
                view.stadiumGuid = stadium.guid;
                view.stadiumCity = stadium.city;
                view.groupName = g.name;
                view.groupGuid = g.guid;                
                view.matchDate = m.date.toString();
                view.guid = uuid();        
                view.home = m.home;
                view.away = m.away;
                view.draw = m.draw;      
                view.awayFlag = awayTeam.emoji;          
                view.homeFlag = homeTeam.emoji;
                view.homeFifaCode = homeTeam.fifaCode;
                view.awayFifaCode = awayTeam.fifaCode;
                view.homeIso2 = homeTeam.iso2;
                view.awayIso2 = awayTeam.iso2;                

                await viewRepo.save(view);
            });
        });
    
        // Knockout Matches
        // TODO: Knockout Matches
    }

    // This is quadratic time complexity O(N^2). I can improve this with a hashtable O(1).
    private getTeam(teams:Array<Team>, id: number): Team{
        return  _.find(teams, (t: Team) => {
            return t.refId == id;
        });
    }

    // This is quadratic time complexity O(N^2). I can improve this with a hashtable O(1).
    private getStadium(stadiums: Array<Stadium>, id: number): Stadium{
        return _.find(stadiums, (s: Stadium) => {
            return s.refId == id;
        });
    }        
    
    public async getMatchByGuid(guid: string): Promise<MatchView>{
        const viewRepo = getCustomRepository(MatchViewRepository);
        return await viewRepo.getMatchViewByGuid(guid);   
    }

    public async finishMatchView(guid: string): Promise<MatchView>{
        const viewRepo = getCustomRepository(MatchViewRepository);
        const matchView = await viewRepo.getMatchViewByGuid(guid);
        matchView.isFinished = true;

        return await viewRepo.save(matchView);
    }    

    public async getMatchView(): Promise<Array<MatchView>>{
        const viewRepo = getCustomRepository(MatchViewRepository);

        return await viewRepo.getSortedByDateMatch();
    }

}