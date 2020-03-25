// TypeORM
import { PrimaryGeneratedColumn, Column, OneToMany, Entity, OneToOne, JoinColumn, ManyToOne } from "typeorm";

// Local Deps
import { IIdentificable } from "./IIdentificable";
import { IEntity } from "./IEntity";
import { User } from "./User";
import { GroupBet } from "./GroupBet";
import { GroupBetRequestStatusEnum } from "./enums/GroupBetRequestStatusEnum";

@Entity()
export class GroupBetRequest implements IIdentificable, IEntity{
    @PrimaryGeneratedColumn()    
    id: number;
    
    @ManyToOne(type => User)
    @JoinColumn()
    requestor: User;

    @ManyToOne(type => User)
    @JoinColumn()
    approver: User;

    @ManyToOne(type => GroupBet)
    @JoinColumn()  
    requestGroup: GroupBet;

    @Column({
        nullable: true
    })   
    guid: string;
    
    @Column({
        nullable: true
    })  
    status: number;

    public setRequestorInfo(user: User){
        this.requestor = user;
    }

    public setGroupBetInfo(group: GroupBet){
        this.requestGroup = group;
    }

    public setWaitingApproval(){
        this.status = GroupBetRequestStatusEnum.WAITING;
    }

    public setApproved(){
        this.status = GroupBetRequestStatusEnum.APPROVED;
    }

    public setRejected(){
        this.status = GroupBetRequestStatusEnum.REJECTED;
    }

    public setManager(user: User){
        this.approver = user;      
    }

    public setUUID(uuid: string){
        this.guid = uuid;
    }
}