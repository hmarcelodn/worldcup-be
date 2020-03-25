// TypeORM
import "reflect-metadata";
import {createExpressServer, useContainer, Action, useExpressServer} from "routing-controllers";
import {useContainer as useContainerSocket, useSocketServer} from 'socket-controllers';
import {createConnection, getCustomRepository} from "typeorm";
import {Container} from "typedi";
import * as jwt from "jsonwebtoken";
import * as fs from "fs";
import * as socketio from "socket.io";
import * as path from "path";
import * as bodyParser from  "body-parser";
import * as express from "express";

// Local Deps
import { BootstrapController } from "./controller/BootstrapController";
import { GroupController } from "./controller/GroupController";
import { TeamController } from "./controller/TeamController";
import { User } from "./entity/User";
import { UserRepository } from "./repository/UserRepository";
import { FixtureController } from "./controller/FixtureController";
import { MatchController } from "./controller/MatchController";
import { UserController } from "./controller/UserController";
import { UserGroupBetController } from "./controller/UserGroupBetController";

createConnection().then(async connection => {
    connection.synchronize(false);   

    // Use DI
    useContainer(Container);
    useContainerSocket(Container);

    // Configure Express
    const port = process.env.PORT || '3000';

    // Setup express application
    const app = express();
    app.use(bodyParser.urlencoded());

    useExpressServer(app,{
        routePrefix: "/api",
        middlewares: [],
        interceptors: [],      
        cors: true,
        controllers: [
            BootstrapController,
            FixtureController,
            GroupController,
            MatchController,
            TeamController,
            UserController,
            UserGroupBetController
        ],
        authorizationChecker: async (action: Action, roles: string[]) => {     
            try{
                const token = action.request.headers["authorization"];
                
                if(token){
                    let decodedToken: any = jwt.verify(token, "worldcup-aes"); 

                    if(decodedToken){    
                        return true;                    
                    }
                }
                
                return false;
            }
            catch(e){
                return false;
            }
        },
        currentUserChecker: async (action: Action) => {
            const token = action.request.headers["authorization"];
            const userRepo = getCustomRepository(UserRepository);
            
            return await userRepo.getByToken(token);            
        }                   
    });     

    // Setup view engine (ejs)
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));  

    // Connect Express and Socket servers
    const server = app.listen(port, () => console.log(`listening on port ${port}`));        
    const io = socketio(server);    

    // Load WS-Controllers
    useSocketServer(io, {
        controllers: [__dirname + '/ws-controller/*.ts']
    });      
});
