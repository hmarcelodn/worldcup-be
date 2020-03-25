// Node Dependencies
import { Service } from "typedi";
import * as fs from "fs";

// Local Dependencies
import { ITeamRepository } from "../entity/repository/ITeamRepository";
import { EntityRepository, Repository } from "typeorm";
import { Team } from "../entity/Team";

@Service()
@EntityRepository(Team)
export class TeamRepository extends Repository<Team> implements ITeamRepository{
    
}
