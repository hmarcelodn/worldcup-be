// TypeORM
import { Column, PrimaryGeneratedColumn, Entity } from "typeorm";

// LocalDeps
import { IIdentificable } from "./IIdentificable";

@Entity()
export class MatchView implements IIdentificable{    

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: true
    })       
    matchDate: string;

    @Column({
        nullable: true
    })       
    homeTeamName: string;

    @Column({
        nullable: true
    })       
    homeTeamGuid: string;

    @Column({
        nullable: true
    })       
    homeGoals: number;

    @Column({
        nullable: true
    })       
    awayTeamName: string;

    @Column({
        nullable: true
    })       
    awayTeamGuid: string;

    @Column({
        nullable: true
    })       
    awayGoals: number;    

    @Column({
        nullable: true
    })       
    groupName: string;

    @Column({
        nullable: true
    })       
    groupGuid: string;

    @Column({
        nullable: true
    })       
    stadiumName: string;

    @Column({
        nullable: true
    })  
    stadiumCity: string;

    @Column({
        nullable: true
    })       
    stadiumGuid: string;

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
    
    @Column({
        nullable: true
    })      
    homeFlag: string;

    @Column({
        nullable: true
    })      
    awayFlag: string;    

    @Column({
        nullable: true
    })         
    homeIso2: string;

    @Column({
        nullable: true
    })         
    awayIso2: string;

    @Column({
        nullable: true
    })       
    homeFifaCode: string;

    @Column({
        nullable: true
    })       
    awayFifaCode: string;
    
    @Column({
        nullable: true,
        default: false      
    })      
    isFinished: boolean;

    @Column({
        nullable: true
    })      
    homePercent: string;

    @Column({
        nullable: true
    })      
    awayPercent: string;

    @Column({
        nullable: true
    })      
    drawPercent: string;

    @Column({
        nullable: true
    })      
    video: string;
}