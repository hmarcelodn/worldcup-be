// TypeORM
import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

// Local deps
import { ITeam } from "./ITeam";
import { IIdentificable } from "./IIdentificable";
import { IMappableId } from "./IMappableId";

@Entity()
export class Team implements ITeam, IIdentificable, IMappableId{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false
    })    
    refId: number;

    @Column({
        nullable: false
    })    
    name: string;

    @Column({
        nullable: false
    })    
    fifaCode: string;

    @Column({
        nullable: false
    })    
    iso2: string;

    @Column({
        nullable: false
    })    
    flag: string;

    @Column({
        nullable: false
    })    
    emoji: string;
    
    @Column({
        nullable: false
    })    
    emojiString: string;

    @Column({
        nullable: true
    })       
    guid: string;     
}


