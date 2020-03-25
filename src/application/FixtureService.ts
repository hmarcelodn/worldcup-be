// TypeORM
import { getCustomRepository } from "typeorm";
import { Service } from "typedi";
import * as uuid from "uuid/v4";
import * as moment from "moment";

// Local-Deps
import { FixtureBetModel } from "../model/FixtureBetModel";
import { FixtureRepository } from "../repository/FixtureRepository";
import { Fixture } from "../entity/Fixture";
import { MatchViewRepository } from "../repository/MatchViewRepository";
import { UserRepository } from "../repository/UserRepository";
import { GroupBetRepository } from "../repository/GroupBetRepository";
import { User } from "../entity/User";

@Service()
export class FixtureService{
    public async saveFixture(model: FixtureBetModel, user: User): Promise<void>{

        // Repos
        const fixtureRepo = getCustomRepository(FixtureRepository);
        const matchViewRepo = getCustomRepository(MatchViewRepository);
        const userRepo = getCustomRepository(UserRepository);   
        const groupRepo = getCustomRepository(GroupBetRepository);            
        
        const validationPromise = new Promise(async (resolve, reject) => {

            // Valid User
            if(!await userRepo.getUserByGuid(user.guid)){
                reject("GUID de usuario inválido: " + user.guid);
            }

            // Valid Group
            if(!await groupRepo.getUserGroupBetByUUID(model.groupGuid)){
                reject("GUID de grupo inválido");
            }   

            let waiter = model.matches.length;

            // Penalty O(n) to validate every single match
            model.matches.forEach(async (m) => {

                waiter--;

                // Valid Match
                let matchView = await matchViewRepo.getMatchViewByGuid(m.matchGuid)

                if(!matchView){
                    reject("GUID de partido inválido.");
                }        
                
                // Valid Goals
                if(m.awayGoalsBet !== undefined && m.awayGoalsBet !== null){
                    if(isNaN(m.awayGoalsBet)){
                        reject("Número inválido de goles visitante.");
                    }   
                }                 
                
                if(m.homeGoalsBet !== undefined && m.homeGoalsBet !== undefined){
                    if(isNaN(m.homeGoalsBet)){
                        reject("Número inválido de goles local.");
                    }     
                }            
                
                // Valid Dates
                const currentDate = moment().utc();
                const matchDate = moment(matchView.matchDate).utc();
                
                if(currentDate > matchDate){
                    reject("Algunos partidos enviados ya comenzaron y no pueden guardarse.");
                }

                // Resolve
                if(waiter === 0){
                    resolve();
                }
            });  
        });

        return validationPromise.then((data) => {

            let waiter = model.matches.length;  

            // O(n) for saving all
            model.matches.forEach(async (m) => {
                waiter--;

                // Valid Full Combination
                const fixtures= await fixtureRepo.getFixtureByGroupBetUserMatch(model.groupGuid, user.guid, m.matchGuid);
                           
                if(fixtures.length > 0){
                    let fixtureLoaded = fixtures[0];
                    fixtureLoaded.awayGoalsBet = m.awayGoalsBet;
                    fixtureLoaded.homeGoalsBet = m.homeGoalsBet;

                    await fixtureRepo.save(fixtureLoaded);
                }
                else{
                    let fixture = new Fixture();                    
                    fixture.awayGoalsBet = m.awayGoalsBet;
                    fixture.homeGoalsBet = m.homeGoalsBet;
                    fixture.matchGuid = m.matchGuid;
                    fixture.userGuid = user.guid;
                    fixture.groupGuid = model.groupGuid;
                    fixture.guid = uuid();
                    fixture.userName = user.firstName + ", " + user.lastName;
                    fixture.picture = user.picture;                    
    
                    await fixtureRepo.save(fixture);
                }                
            });  

            if(waiter === 0){
                return Promise.resolve();                
            }
        })
        .catch((err) => {
            return Promise.reject("Fallo cargando el partido: " + err);
        });
    }
    
    public async getFixtureByGroupGuid(guid: string): Promise<Array<Fixture>>{
        const fixtureRepo = getCustomRepository(FixtureRepository);
        return await fixtureRepo.getFixtureByGroupGuid(guid);
    }

    public async getFixture(groupGuid: string, user: User): Promise<Array<Fixture>>{
        const fixtureRepo = getCustomRepository(FixtureRepository);        
        return await fixtureRepo.getFixtureByGroupBetUserMatch(groupGuid, user.guid, null);
    }

    public async getFixturesCount(): Promise<number>{
        const fixtureRepo = getCustomRepository(FixtureRepository);                
        return await fixtureRepo.getTotal();
    }
}