// TypeORMs
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

// Local Deps
import { IStadium } from "./IStadium";
import { IIdentificable } from "./IIdentificable";
import { IMappableId } from "./IMappableId";

@Entity()
export class Stadium implements IStadium, IIdentificable, IMappableId {
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
    city: string;

    @Column({
        nullable: false
    })      
    lat: string;

    @Column({
        nullable: false
    })      
    lng: string;


    @Column({
        nullable: true
    })       
    guid: string;     
}