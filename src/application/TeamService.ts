// TypeORM
import { Service } from "typedi";
import { getCustomRepository } from "typeorm";

// Local Deps
import { Team } from "../entity/Team";
import { TeamRepository } from "../repository/TeamRepository";

@Service()
export class TeamService{
    public async getTeams(): Promise<Array<Team>>{
        const teamRepo = getCustomRepository(TeamRepository);
        
        return await teamRepo.find();
    }
}