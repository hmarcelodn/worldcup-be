// TypeORM
import "reflect-metadata";
import {JsonController, Param, Body, Get, Post, Put, Delete, Controller, Res, Req, Authorized} from "routing-controllers";
import {Container, Inject, Service} from "typedi";

// Local Deps
import { GroupService } from "../application/GroupService";

@Authorized()
@JsonController("/group")
export class GroupController{

    @Inject()
    groupService: GroupService;

    @Get("/")
    async get(){
        return this.groupService.getGroups();
    }
}
