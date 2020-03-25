// TypeOrm
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";

// LocalDeps
import { Group } from "./Group";
import { IMatch } from "./IMatch";
import { IIdentificable } from "./IIdentificable";
import { IMappableId } from "./IMappableId";

@Entity()
export class Match implements IMatch, IIdentificable, IMappableId{

    @PrimaryGeneratedColumn()
    id: number;
   
    @Column({
        nullable: true
    })     
    refId: number;

    @Column({
        nullable: true
    })     
    name: number;

    @Column({
        nullable: true
    })     
    type: string;

    @Column({
        nullable: true
    })     
    home_team: number;

    @Column({
        nullable: true
    })     
    away_team: number;

    @Column({
        nullable: true
    })     
    home_result: string;

    @Column({
        nullable: true
    })     
    away_result: string;

    @Column({
        nullable: true
    })    
    date: Date;

    @Column({
        nullable: true
    })     
    stadium: number;

    @Column({
        nullable: true
    })     
    finished: boolean;

    @Column({
        nullable: true
    })     
    matchday: number;

    @ManyToOne(type => Group, group => group.matches)
    group: Group;

    @Column({
        nullable: true
    })       
    guid: string;     

    @Column({
        nullable: true
    })     
    home: string;

    @Column({
        nullable: true
    }) 
    draw: string;    

    @Column({
        nullable: true
    }) 
    away: string;    
}