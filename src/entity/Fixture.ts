// TypeORM
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

// Local-Deps
import { IIdentificable } from "./IIdentificable";

@Entity()
export class Fixture implements IIdentificable{
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: true
    })        
    homeGoalsBet: number;

    @Column({
        nullable: true
    })        
    awayGoalsBet: number;

    @Column({
        nullable: true
    })     
    groupGuid: string;

    @Column({
        nullable: true
    })     
    userGuid: string;

    @Column({
        nullable: true
    })     
    userName: string;

    @Column({
        nullable: true
    })  
    picture: string;    

    @Column({
        nullable: true
    })     
    matchGuid: string;

    @Column({
        nullable: true
    })     
    guid: string;
}