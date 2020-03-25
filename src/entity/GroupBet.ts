// TypeORM
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

// Local Deps
import { IIdentificable } from "./IIdentificable";
import { GroupBetItem } from "./GroupBetItem";

@Entity()
export class GroupBet implements IIdentificable{
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: true
    })      
    name: string;    

    @Column({
        nullable: true
    })     
    guid: string;

    @OneToMany(type => GroupBetItem, groupBetItem => groupBetItem.groupBet, {
        cascade: true
    })    
    items: Array<GroupBetItem>;

    @Column({
        nullable: true
    })      
    type: number;
    
}