// TypeORM
import {getCustomRepository} from "typeorm";
import {Container, Inject, Service} from "typedi";
import axios from "axios";
import * as uuid from "uuid/v4";
import * as _ from "lodash";

// Local Deps
import { Team } from "../entity/Team";
import { Stadium } from "../entity/Stadium";
import { Match } from "../entity/Match";
import { Group } from "../entity/Group";
import { MatchView } from "../entity/MatchView";
import { ITeam } from "../entity/ITeam";
import { IMatch } from "../entity/IMatch";
import { IGroup } from "../entity/IGroup";
import { IStadium } from "../entity/IStadium";
import { MatchViewRepository } from "../repository/MatchViewRepository";
import { StadiumRepository } from "../repository/StadiumRepository";
import { GroupRepository } from "../repository/GroupRepository";
import { TeamRepository } from "../repository/TeamRepository";

@Service()
export class BootstrapService{

    private SERVICE_FIFA : string = "https://spineway.blob.core.windows.net/pwaprode/fixture.json";

    public async pushData(): Promise<any>{
        const data : any = await axios.get(this.SERVICE_FIFA);      
        const teamRepo = getCustomRepository(TeamRepository);
        const stadiumRepo = getCustomRepository(StadiumRepository);        

        // Load Stadiums
        data.data.stadiums.map(async (data: IStadium) => { 
            let stadium = new Stadium();
            stadium.city = data.city;
            stadium.lat = data.lat;
            stadium.lng = data.lng;
            stadium.name = data.name;    
            stadium.guid = uuid();  
            stadium.refId = data.id;
            
            await stadiumRepo.save(stadium);
        });        

        // Load Groups
        this.pushGroup(data.data.groups.a);
        this.pushGroup(data.data.groups.b);
        this.pushGroup(data.data.groups.c);
        this.pushGroup(data.data.groups.d);
        this.pushGroup(data.data.groups.e);
        this.pushGroup(data.data.groups.f);
        this.pushGroup(data.data.groups.g);
        this.pushGroup(data.data.groups.h);

        // Load Knockout
        // TODO: Load Knockout

        // Load Teams
        data.data.teams.map(async (data: ITeam) => {
            let team = new Team();
            team.emoji = data.emoji;
            team.emojiString = data.emojiString;
            team.fifaCode = data.fifaCode;
            team.flag = data.flag;
            team.iso2 = data.iso2;
            team.name = data.name;
            team.guid = uuid(); 
            team.refId = data.id;

            await teamRepo.save(team);
        });

        return Promise.resolve();    
    }

    private async pushGroup(data: IGroup){
        const groupRepo = getCustomRepository(GroupRepository);
     
        let group = new Group();
        group.name = data.name;
        group.runnerup = data.runnerup;
        group.winner = data.winner;
        group.matches = new Array<Match>();
        group.guid = uuid();

        data.matches.map(async (matchData: IMatch) => {
            let match = new Match();      
            match.away_result = matchData.away_result;
            match.away_team = matchData.away_team;
            match.date = matchData.date;
            match.finished = matchData.finished;
            match.home_result = matchData.home_result;
            match.home_team = matchData.home_team;
            match.matchday = matchData.matchday;
            match.name = matchData.name;
            match.stadium = matchData.stadium;
            match.type = matchData.type; 
            match.guid = uuid();           
            match.away = "1";
            match.home = "1";
            match.draw = "1";
            match.refId = matchData.id;
            
            group.matches.push(match);
        });

        await groupRepo.save(group);       
    }
}