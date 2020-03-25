// TypeORM
import { PrimaryGeneratedColumn, Column, OneToMany, Entity } from "typeorm";

// Local Deps
import { IGroup } from "./IGroup";
import { IMatch } from "./IMatch";
import { Match } from "./Match";
import { IIdentificable } from "./IIdentificable";

@Entity()
export class Group implements IGroup, IIdentificable{

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({
        nullable: true
    })         
    name: string;

    @Column({
        nullable: true
    })         
    winner: string;

    @Column({
        nullable: true
    })         
    runnerup: string;
    
    @OneToMany(type => Match, match => match.group, {
        cascade: true
    })
    matches: Match[];

    @Column({
        nullable: true
    })       
    guid: string;    
}