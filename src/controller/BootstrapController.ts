// TypeORM
import "reflect-metadata";
import {Request, Response} from "express"
import {JsonController, Param, Body, Get, Post, Put, Delete, Controller, Res, Req} from "routing-controllers";
import {Container, Inject, Service} from "typedi";

// Local Deps
import { BootstrapService } from "../application/BootstrapService";
import { MatchViewService } from "../application/MatchViewService";

@JsonController("/bootstrap")
export class BootstrapController{
    
    @Inject()
    bootstrapService: BootstrapService;

    @Inject()
    matchViewService: MatchViewService;

    @Post("/")
    async post(@Req() request: Request, @Res() response: Response){
        await this.bootstrapService.pushData();
        return response.send();
    }

    @Post("/createMatchView")
    async createView(@Req() request: Request, @Res() response: Response){
        await this.matchViewService.createMatchView();   
        return response.send();
    }
}
