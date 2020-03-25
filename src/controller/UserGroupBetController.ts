// TypeORM
import "reflect-metadata";
import {JsonController, Param, Body, Get, Post, Put, Delete, Controller, Res, Req, Authorized, CurrentUser} from "routing-controllers";
import {Container, Inject, Service} from "typedi";
import { Response } from "express";

// Local Deps
import { GroupBetService } from "../application/GroupBetService";
import { GroupBetModel } from "../model/GroupBetModel";
import { User } from "../entity/User";
import { JoinUserGroupModel } from "../model/JoinUserGroupModel";
import { SearchUserGroupModel } from "../model/SearchUserGroupModel";
import { GroupBetCommentModel } from "../model/GroupBetCommentModel";
import { ApproveRequestModel } from "../model/ApproveRequestModel";
import { RequestRejectModel } from "../model/RejectRequestModel";
import { GroupBetType } from "../entity/enums/GroupBetTypeEnum";

@JsonController("/usergroupbet")
export class UserGroupBetController{

    @Inject()
    private groupBetService: GroupBetService;

    @Authorized()
    @Post("/")
    async postPrivate(@Body() model: GroupBetModel, @CurrentUser({ required: true }) user: User, @Res() response: Response){
        try{
            let groupBet = await this.groupBetService.createPrivateGroup(model, user);            
            return response.send({
                guid: groupBet.guid
            });
        }
        catch(e){
            return response.status(400).send({
                error: e
            });
        }
    }

    //@Authorized()
    @Post("/public")
    async postPublic(@Body() model: GroupBetModel, @Res() response: Response){
        try{
            let groupBet = await this.groupBetService.createPublicGroup(model); 
                       
            return response.send({
                guid: groupBet.guid
            });
        }
        catch(e){
            return response.status(400).send({
                error: e
            });
        }
    }    

    @Authorized()
    @Get("/")
    async get(){
        return await this.groupBetService.getUserGroupBets();
    }

    @Authorized()
    @Get("/public")
    async getPublic(@CurrentUser({ required: true }) user: User){
        return await this.groupBetService.getPublicGroups(user);
    }    

    @Authorized()
    @Post("/search")
    async search(@Body() model: SearchUserGroupModel){
        return await this.groupBetService.getByName(model.name);
    }

    @Authorized()
    @Get("/usergroups")
    async getGroupsByUser(@CurrentUser({ required: true }) user: User){
        return await this.groupBetService.getUserGroups(user);
    }

    @Authorized()
    @Post("/join")
    async join(@Body() model: JoinUserGroupModel, @Res() response: Response, @CurrentUser({ required: true }) user: User){        
        try{
            await this.groupBetService.requestAccessToGroup(user, model.groupGuid);    
            return response.sendStatus(200);        
        }
        catch(e){
            return response.status(400).send({
                error: e
            });
        }         
    } 

    @Authorized()
    @Post("/join/public")    
    async joinPublic(@Body() model: JoinUserGroupModel, @Res() response: Response, @CurrentUser({ required: true }) user: User){
        try{
            await this.groupBetService.joinPublicGroup(user, model.groupGuid)    
            return response.sendStatus(200);        
        }
        catch(e){
            return response.status(400).send({
                error: e
            });
        } 
    }

    @Authorized()
    @Post("/join/quick")    
    async joinQuick(@Body() model: JoinUserGroupModel, @Res() response: Response, @CurrentUser({ required: true }) user: User){
        try{
            await this.groupBetService.quickLinkJoin(user, model.groupGuid)    
            return response.sendStatus(200);        
        }
        catch(e){
            return response.status(400).send({
                error: e
            });
        } 
    }
    

    @Authorized()
    @Post("/approve")    
    async approveRequest(@Body() model: ApproveRequestModel, @Res() response: Response, @CurrentUser({ required: true }) user: User){
        try{
            await this.groupBetService.approveAccessToGroup(user, model.requestGuid);
            return response.sendStatus(200);
        }
        catch(e){
            return response.status(400).send({
                error: e
            });
        }
    }

    @Authorized()
    @Post("/reject")    
    async rejectRequest(@Body() model: RequestRejectModel, @Res() response: Response, @CurrentUser({ required: true }) user: User){
        try{
            await this.groupBetService.rejectAccessToGroup(user, model.requestGuid);
            return response.sendStatus(200);
        }
        catch(e){
            return response.status(400).send({
                error: e
            });
        }
    }

    @Authorized()
    @Get("/request/waiting")
    async getWaitingRequests(@CurrentUser({ required: true }) user: User){
        return await this.groupBetService.getWaitingRequests(user);
    }

    @Authorized()
    @Get("/request/approved")
    async getApprovedRequests(@CurrentUser({ required: true }) user: User){
        return await this.groupBetService.getApprovedRequests(user);        
    }    

    @Authorized()
    @Get("/request/rejected")
    async getRejectedRequests(@CurrentUser({ required: true }) user: User){
        return await this.groupBetService.getRejectedRequests(user);        
    }    

    // Import Processes
    // @Authorized()
    // @Post("/import/manager")    
    // async importManager(@Res() response: Response){
    //     try{
    //         await this.groupBetService.runImportManagerProcess();
    //         return response.sendStatus(200); 
    //     }
    //     catch(e){
    //         return response.status(400).send({
    //             error: e
    //         });
    //     }
    // }

    // @Authorized()
    @Post("/import")
    async import(@Res() response: Response){
        try{
            await this.groupBetService.runImportProcess();
            return response.sendStatus(200); 
        }
        catch(e){
            return response.status(400).send({
                error: e
            });
        }
    }

    //@Authorized()
    @Post("/import/users")
    async importUsers(@Res() response: Response){
        try{
            await this.groupBetService.runImportUsersProcess();
            return response.sendStatus(200); 
        }
        catch(e){
            return response.status(400).send({
                error: e
            });
        }
    }

}
