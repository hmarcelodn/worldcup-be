//TypeOrm
import { Container, Inject, Service } from "typedi";
import { EntityRepository, Repository } from "typeorm";

// Entity
import { User } from "../entity/User";
import { IUserRepository } from "../entity/repository/IUserRepository";

@EntityRepository(User)
export class UserRepository extends Repository<User> implements IUserRepository{
    public async getByToken(token: string): Promise<User> {
        return await this.createQueryBuilder("user")
            .where("user.currentToken = :token", { token: token })
            .getOne();
    }

    public async getByUserName(username: string): Promise<User> {
        return await this.createQueryBuilder("user")
                         .where("user.username = :username", { username: username })
                         .getOne();
    }
    
    public async getByEmailAddress(email: string): Promise<User> {
        return await this.createQueryBuilder("user")
                         .where("user.emailAddress = :email", { email: email })
                         .getOne();
    }

    public async getExternalByEmailAddress(email: string, type: string): Promise<User> {
        return await this.createQueryBuilder("user")
                         .where("user.emailAddress = :email", { email: email })
                         .andWhere("user.type = :type", { type: type })
                         .getOne();
    }    

    public async getExistByEmailAddress(email: string): Promise<boolean> {
        return (await this.createQueryBuilder("user")
                         .where("user.emailAddress = :email", { email: email })
                         .getCount() > 0);
    }
    
    public async getPasswordByUserName(username: string): Promise<string> {
        return await this.createQueryBuilder("user")
                         .where("user.username = :username", { username: username })
                         .select("user.password", "password")
                         .getRawOne();
    }

    public async getUserByGuid(guid: string): Promise<User>{
        return await this.createQueryBuilder("user")
                         .where("user.guid = :guid", { guid: guid })
                        .getOne();
    }

    public async getUsersByIdList(ids: Array<number>): Promise<Array<User>>{
        return await this.findByIds(ids);
    }
    
}
