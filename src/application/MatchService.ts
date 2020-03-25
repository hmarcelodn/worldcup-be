// TypeORM
import { Service, Inject } from "typedi";
import { getCustomRepository } from "typeorm";

// Local Deps
import { Match } from "../entity/Match";
import { MatchViewRepository } from "../repository/MatchViewRepository";
import { MatchView } from "../entity/MatchView";

@Service()
export class MatchService{

    public async getAllMatchesByDay(): Promise<Array<MatchView>>{      
        const matchRepo = getCustomRepository(MatchViewRepository);

        return await matchRepo.getSortedByDateMatch();
    }
    
    public async getNextMatches(): Promise<Array<MatchView>> {
        const matchRepo = getCustomRepository(MatchViewRepository);

        return await matchRepo.getNextMatches();
        //return Promise.resolve(new Array<MatchView>());
    }

}