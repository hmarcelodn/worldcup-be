// TypeORM
import "reflect-metadata";
import {JsonController, Param, Body, Get, Post, Put, Delete, Controller, Res, Req, Authorized, CurrentUser} from "routing-controllers";
import {Container, Inject, Service} from "typedi";

// Local Deps
import { TeamService } from "../application/TeamService";

@Authorized()
@JsonController("/team")
export class TeamController{

    @Inject()
    teamService: TeamService;

    @Get("/")
    async get(){
        return await this.teamService.getTeams();
    }
}
