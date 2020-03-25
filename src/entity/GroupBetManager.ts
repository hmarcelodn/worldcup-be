// TypeORM
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from "typeorm";

// LocalDeps
import { IIdentificable } from "./IIdentificable";
import { IEntity } from "./IEntity";
import { User } from "./User";
import { GroupBet } from "./GroupBet";

@Entity()
export class GroupBetManager  implements IIdentificable, IEntity{
    @PrimaryGeneratedColumn()  
    id: number; 

    @OneToOne(type => GroupBet)
    @JoinColumn()      
    managingGroupBet: GroupBet;

    @ManyToOne(type => User)
    @JoinColumn()      
    userManager: User;  

    @Column({
        nullable: true
    })    
    guid: string;    
}