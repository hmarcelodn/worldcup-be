// TypeORM
import { Column, PrimaryGeneratedColumn, Entity, ManyToMany, ManyToOne } from "typeorm";

// LocalDeps
import { IIdentificable } from "./IIdentificable";
import { User } from "./User";
import { GroupBet } from "./GroupBet";

@Entity()
export class Score implements IIdentificable{
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: true
    })     
    points: string;    

    @Column({
        nullable: true
    })      
    guid: string;

    @ManyToOne(type => User, user => User)    
    user: User;

    @ManyToOne(type => GroupBet, group => GroupBet)
    group: GroupBet;

    public addUser(user: User){
        this.user = user;
    }

    public setPoints(){
        this.points = "0";
    }

    public sumPoints(points: string){
        if(this.points == undefined){
            this.points = "0";
        }      
        
        this.points = (parseFloat(points) + parseFloat(this.points)).toString();
    }

    public setUUID(uuid: string){
        this.guid = uuid;
    }

    public setGroup(group: GroupBet){
        this.group = group;
    }
}