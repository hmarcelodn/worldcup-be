// TypeORM
import "reflect-metadata";
import {JsonController, Param, Body, Get, Post, Put, Delete, Controller, Res, Req, Authorized, CurrentUser} from "routing-controllers";
import {Container, Inject, Service} from "typedi";
import { Response, Request } from "express";
import * as R from "ramda";

// Local Deps
import { GroupService } from "../application/GroupService";
import { MatchService } from "../application/MatchService";
import { FixtureService } from "../application/FixtureService";
import { UserMatchViewModel } from "../model/UserMatchViewModel";
import { User } from "../entity/User";
import { GroupBetService } from "../application/GroupBetService";
import { MatchScoreService } from "../application/MatchScoreService";
import { ComputeMatchModel } from "../model/ComputeMatchModel";
import { MatchViewService } from "../application/MatchViewService";
import { MatchSaveModel } from "../model/MatchSaveModel";
import { error } from "util";
import { MatchView } from "../entity/MatchView";

@JsonController("/match")
export class MatchController{

    @Inject()
    matchService: MatchService;

    @Inject()
    fixtureService: FixtureService;

    @Inject()
    groupBetService: GroupBetService;

    @Inject()
    matchScoreService: MatchScoreService;    

    @Inject()
    matchViewService: MatchViewService;

    @Authorized()
    @Get("/groups/:group")
    public async matchesByDay(@Param("group") group: string, @CurrentUser({ required: true }) user: User ){
        let userMatchView: UserMatchViewModel = new UserMatchViewModel();      
        let groupBet = await this.groupBetService.getByGuid(group, user);
        
        // ORM Projections
        userMatchView.matchView = await this.matchService.getAllMatchesByDay();
        userMatchView.userBet = await this.fixtureService.getFixture(group, user);
        userMatchView.groupName = groupBet.name;

        return userMatchView;
    }

    @Get("/next")
    public async getNextMatch(){
        return await this.matchService.getNextMatches();
    }

    @Get("/all")
    public async matches(){
        return await this.matchViewService.getMatchView();
    }

    // Server Side - Index
    @Get("/index")
    public async index(@Res() response: Response){    
        const matchView: Array<MatchView> = await this.matchService.getAllMatchesByDay();         
        const sortedArr = matchView.sort(
            (d1, d2) => new Date(d1.matchDate).getTime() - new Date(d2.matchDate).getTime());      

        const options: Object = {
          "message": "Match Fixture - Russia WorldCup 2018",
          "matches": sortedArr
        };

        response.render("index", options);
    }

    // Server Side - Update Screen
    @Get("/index/:guid")
    public async update(@Param("guid") guid: string, @Res() response: Response){    
        const matchView = await this.matchViewService.getMatchByGuid(guid); 

        response.render("update", {
            "homeTeamGoals": matchView.homeGoals,
            "awayTeamGoals": matchView.awayGoals,
            "homeTeamName": matchView.homeTeamName,
            "awayTeamName": matchView.awayTeamName,
            "guid": matchView.guid,
            "isFinished": matchView.isFinished,
            "video": matchView.video            
        });
    }

    // Server Side - Compute Screen
    @Get("/compute/:guid")
    public async computeIndex(@Param("guid") guid: string, @Res() response: Response){    
        const matchView = await this.matchViewService.getMatchByGuid(guid); 

        // Check if already processed
        if(matchView.isFinished){
            throw new error("El partido ya fue procesado anteriormente.");
        }

        response.render("compute", {
            "homeTeamGoals": matchView.homeGoals,
            "awayTeamGoals": matchView.awayGoals,
            "homeTeamName": matchView.homeTeamName,
            "awayTeamName": matchView.awayTeamName,
            "guid": matchView.guid,
            "isFinished": matchView.isFinished            
        });
    }

    // Server Side - Save
    @Post("/:guid")
    public async post(@Param("guid") guid: string,@Body() model: MatchSaveModel, @Req() request: Request, @Res() response: Response){
        await this.matchScoreService.saveAndComputeMatchWithoutSocket(
            guid,
            model.inputAwayTeam, 
            model.inputHomeTeam,
            model.video
        );

        response.redirect("/api/match/index");
    }

    // Server Side - Compute
    @Post("/compute/:guid")
    public async compute(@Param("guid") guid: string, @Req() request: Request, @Res() response: Response){
        const matchView = await this.matchViewService.getMatchByGuid(guid); 

        // Check if already processed
        if(matchView.isFinished){
            throw new error("El partido ya fue procesado anteriormente.");
        }

        // Compute and Finish
        await this.matchScoreService.computeScore(guid);
        await this.matchViewService.finishMatchView(guid);

        response.redirect("/api/match/index");        
    }
}