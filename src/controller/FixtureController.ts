// TypeORM
import "reflect-metadata";
import {JsonController, Param, Body, Get, Post, Put, Delete, Controller, Res, Req, Authorized, CurrentUser} from "routing-controllers";
import {Container, Inject, Service} from "typedi";
import { Response } from "express";

// Local Deps
import { FixtureBetModel } from "../model/FixtureBetModel";
import { FixtureService } from "../application/FixtureService";
import { User } from "../entity/User";
import { RankingService } from "../application/RankingService";

@JsonController("/fixture")
export class FixtureController{

    @Inject()
    fixtureService: FixtureService;

    @Inject()
    rankingService: RankingService;

    @Authorized()
    @Post("/")
    async post(@Body() model: FixtureBetModel, @Res() response: Response, @CurrentUser({ required: true }) user: User){
        try{
            await this.fixtureService.saveFixture(model, user);    
            return response.sendStatus(200);        
        }
        catch(e){
            return response.status(400).send(e);
        }        
    }

    @Authorized()
    @Get("/:guid")
    async get(@Param("guid") guid: string){
        return await this.fixtureService.getFixtureByGroupGuid(guid);
    }

    @Authorized()
    @Get("/group/:guid/ranking")
    async getRanking(@Param("guid") guid: string, @CurrentUser({ required: true }) user: User){
        return await this.rankingService.getScores(guid, user);
    }

    @Get("/count/total")
    async getTotal(){
        return await this.fixtureService.getFixturesCount();
    }    
}
