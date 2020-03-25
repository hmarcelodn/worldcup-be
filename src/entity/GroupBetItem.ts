// TypeORM
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";

// Local Deps
import { GroupBet } from "./GroupBet";
import { IIdentificable } from "./IIdentificable";
import { User } from "./User";

@Entity()
export class GroupBetItem implements IIdentificable{

    @PrimaryGeneratedColumn()
    id: number;

    // TODO: Remove after import process
    @Column({
        nullable: true
    })    
    userGuid: string;
    // TODO: Remove after import process

    @ManyToOne(type => User, user => User)
    user: User;

    @ManyToOne(type => GroupBet, groupBet => groupBet.items)
    groupBet: GroupBet;

    @Column({
        nullable: true
    })
    guid: string;
        
}