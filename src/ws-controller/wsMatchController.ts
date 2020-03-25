// Sockets Framework
import {SocketController, OnConnect, OnDisconnect, SocketIO, OnMessage, MessageBody, ConnectedSocket} from "socket-controllers";
import { Inject } from "typedi";

// Localdeps
import { MatchScoreService } from "../application/MatchScoreService";
import { ComputeMatchModel } from "../model/ComputeMatchModel";

@SocketController()
export class wsMatchController{

    @Inject()
    matchScoreService: MatchScoreService;

    // @OnMessage("setupMatchCompletion")
    // async setup(@SocketIO() io: any, @MessageBody() message: ComputeMatchModel){        
    //     await this.matchScoreService.SaveAndComputeMatch(
    //         message.matchGuid, 
    //         message.matchViewGuid, 
    //         message.awayGoals, 
    //         message.homeGoals, 
    //         io);                   
    // }   

}