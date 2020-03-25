// TypeORM
import { Service } from "typedi";
import { getCustomRepository } from "typeorm";

// Local Deps
import { GroupRepository } from "../repository/GroupRepository";
import { Group } from "../entity/Group";

@Service()
export class GroupService{
    public async getGroups(): Promise<Array<Group>>{
        const groupRepo = getCustomRepository(GroupRepository);
        
        return await groupRepo.find();
    }
}