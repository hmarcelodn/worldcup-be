import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { IIdentificable } from "./IIdentificable";

@Entity()
export class User implements IIdentificable {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({
        nullable: true
    })    
    password: string;

    @Column({
        nullable: true
    })    
    firstName: string;

    @Column({
        nullable: true
    })    
    lastName: string;

    @Column({
        nullable: true
    })    
    emailAddress: string;

    @Column({
        nullable: true
    })    
    enabled: boolean;

    @Column({
        nullable: true
    })    
    currentToken: string;

    @Column({
        nullable: true
    })    
    guid: string;    

    @Column({
        nullable: true
    })    
    attemps: number

    @Column({
        nullable: true
    })       
    type: string;

    @Column({
        nullable: true
    })  
    picture: string;

    public sumAttemps(): void{
        this.attemps++;
    }

    public cleanAttemps(): void{
        this.attemps = 0;
    }

    public setUserName(userName: string): void {
        //this.userName = userName;
    } 

    public setFirstName(firstName: string): void {
        this.firstName = firstName;
    }

    public setLastName(lastName: string): void {
        this.lastName = lastName;
    }

    public setEmailAddress(emailAddress: string): void {
        this.emailAddress = emailAddress;
    }

    public enable(): void {
        this.enabled = true;
    }

    public disable(): void{
        this.enabled = false;
    }

    public setPassword(passcode: string): void{
        this.password = passcode;
    }

    public isEnabled(): boolean{
        return this.enabled == true;
    }

    public setCurrentToken(token:string): void{
        this.currentToken = token;
    } 

    public setProvider(type: string){
        this.type = type;
    }

    public setInternal(){
        this.type = "internal-auth";
    }    

    public getFullName(){
        return this.lastName + ", " + this.firstName;
    }
}
