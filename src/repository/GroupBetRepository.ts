//TypeOrm
import { Container, Inject, Service } from "typedi";
import { EntityRepository, Repository } from "typeorm";

// Entity
import { GroupBet } from "../entity/GroupBet";
import { IGroupBetRepository } from "../entity/repository/IGroupBetRepository";
import { GroupBetType } from "../entity/enums/GroupBetTypeEnum";

@EntityRepository(GroupBet)
export class GroupBetRepository extends Repository<GroupBet> implements IGroupBetRepository{
    public async getUserGroupBets(): Promise<Array<GroupBet>> {
        return await this.createQueryBuilder("groupBet")
                         .where("groupBet.type", { type: GroupBetType.PRIVATE  })
                         .select("groupBet.name")
                         .addSelect("groupBet.guid")
                         .getMany();
    }

    public async getPublicUserGroupBets(): Promise<Array<GroupBet>> {
        return await this.createQueryBuilder("groupBet")
                         .leftJoinAndSelect("groupBet.items", "groupBetItems")
                         .where("groupBet.type = :type", { type: GroupBetType.PUBLIC  })
                        //  .select("groupBet.name")
                        //  .addSelect("groupBet.guid")
                         .getMany();
    }    

    public async getAll(): Promise<Array<GroupBet>> {
        return await this.createQueryBuilder("groupBet")
                         .leftJoinAndSelect("groupBet.items", "groupBetItems")
                         .getMany();
    }

    public async getUserGroupBetByName(name: string): Promise<GroupBet> {
        return await this.createQueryBuilder("groupBet")
                         .leftJoinAndSelect("groupBet.items", "groupBetItems")
                         .where("groupBet.name = :name", { name: name  })
                         .getOne()
    }

    public async searchByName(name: string): Promise<GroupBet> {
        return await this.createQueryBuilder("groupBet")
                         .where("groupBet.name = :name", { name: name  })
                         .select("groupBet.name")
                         .addSelect("groupBet.guid")
                         .getOne();
    }    

    public async getUserGroupBetsByName(name: string): Promise<Array<GroupBet>> {
        return await this.createQueryBuilder("groupBet")
                         .leftJoinAndSelect("groupBet.items", "groupBetItems")
                         .where("groupBet.name like :name", { name: '%' + name + '%'  })
                         .getMany();
    }    

    public async getUserGroupBetByUUID(uuid: string): Promise<GroupBet> {
        return await this.createQueryBuilder("groupBet")
                         .leftJoinAndSelect("groupBet.items", "groupBetItems")
                         .where("groupBet.guid = :guid", { guid: uuid  })
                         .getOne();
    }    

    public async getUserGroupBetByUserGuid(userGuid: string): Promise<Array<GroupBet>>{
        return await this.createQueryBuilder("groupBet")
            .leftJoinAndSelect("groupBet.items", "groupBetItems")
            .where("groupBetItems.userGuid = :guid", { guid: userGuid })
            .select("groupBet.name")
            .addSelect("groupBet.guid")
            .getMany();   
    }

}
