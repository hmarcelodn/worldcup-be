// TypeORM
import "reflect-metadata";
import {JsonController, Param, Body, Get, Post, Put, Delete, Controller, Res, Req} from "routing-controllers";
import {Container, Inject, Service} from "typedi";

// Local Deps
import { TeamService } from "../application/TeamService";
import { UserService } from "../application/UserService";
import { CreateUserModel } from "../model/CreateUserModel";
import { LoginModel } from "../model/LoginModel";
import { ExternalLoginModel } from "../model/ExternalLoginModel";

@JsonController("/user")
export class UserController{

    @Inject()
    userService: UserService;

    @Post("/")
    async post(@Body() model: CreateUserModel){
        return await this.userService.createUser(model);
    }

    @Post("/login")
    async login(@Body() model: LoginModel){
        return await this.userService.login(model);
    }

    @Post("/google/externalLogin")
    async googleLoginCallback(@Body() model: ExternalLoginModel){
        return await this.userService.externalLogin(model, "google-auth");
    }  

    @Post("/facebook/externalLogin")
    async facebookLoginCallback(@Body() model: ExternalLoginModel){
        return await this.userService.externalLogin(model, "facebook-auth");
    } 
    
    @Post("/twitter/externalLogin")
    async twitterLoginCallback(@Body() model: ExternalLoginModel){
        return await this.userService.externalLogin(model, "twitter-auth");
    }     
}
