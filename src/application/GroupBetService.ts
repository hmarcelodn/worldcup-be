// TypeORM
import { Service } from "typedi";
import { getCustomRepository } from "typeorm";
import * as uuid from "uuid/v4";
import * as R from "ramda";
import * as xss from "xss";

// Local Deps
import { User } from "../entity/User";
import { Score } from "../entity/Score";
import { GroupBet } from "../entity/GroupBet";
import { GroupBetItem } from "../entity/GroupBetItem";
import { GroupBetRequest } from "../entity/GroupBetRequest";
import { JoinUserGroupModel } from "../model/JoinUserGroupModel";
import { GroupBetCommentModel } from "../model/GroupBetCommentModel";
import { GroupBetModel } from "../model/GroupBetModel";
import { ScoreRepository } from "../repository/ScoreRepository";
import { GroupBetRepository } from "../repository/GroupBetRepository";
import { UserRepository } from "../repository/UserRepository";
import { GroupBetRequestRepository } from "../repository/GroupBetRequestRepository";
import { GroupManagerRepository } from "../repository/GroupManagerRepository";
import { GroupBetManager } from "../entity/GroupBetManager";
import { GroupBetType } from "../entity/enums/GroupBetTypeEnum";
import { UserInviteModel } from "../model/UserInviteModel";
import { PublicGroupListModel } from "../model/PublicGroupListModel";

@Service()
export class GroupBetService{
    public async createPrivateGroup(model: GroupBetModel, user: User): Promise<GroupBet>{
        const groupBetRepo = getCustomRepository(GroupBetRepository);
        const userRepo = getCustomRepository(UserRepository);
        const scoreRepo = getCustomRepository(ScoreRepository);
        const managerRepo = getCustomRepository(GroupManagerRepository);
        const name = xss(model.name.toLowerCase());        

        if(await groupBetRepo.getUserGroupBetByName(name)){
            throw "El nombre de grupo ya esta en uso.";
        }

        let groupBet = new GroupBet(); 
        let groupBetItem = new GroupBetItem();
        let groupBetManager = new GroupBetManager();        
        let score = new Score();

        // Add group
        groupBet.name = name;
        groupBet.guid = uuid();
        groupBet.items = new Array<GroupBetItem>();
        groupBet.type = GroupBetType.PRIVATE;

        // Add as member
        groupBetItem.userGuid = user.guid;
        groupBetItem.user = user;
        groupBetItem.guid = uuid();
        groupBet.items.push(groupBetItem);

        await groupBetRepo.save(groupBet);
        
        // Add owner score
        score.setPoints();
        score.setUUID(uuid());
        score.addUser(user);
        score.setGroup(groupBet);

        await scoreRepo.save(score);

        // For private users, create manager
        groupBetManager.guid = uuid();
        groupBetManager.userManager = user;
        groupBetManager.managingGroupBet = groupBet;
    
        await managerRepo.save(groupBetManager);    

        return groupBet;
    }

    public async createPublicGroup(model: GroupBetModel): Promise<GroupBet>{
        const groupBetRepo = getCustomRepository(GroupBetRepository);
        const name = xss(model.name.toLowerCase());

        if(await groupBetRepo.getUserGroupBetByName(name)){
            throw "El nombre de grupo ya esta en uso.";
        }        

        let groupBet = new GroupBet(); 
        groupBet.name = name;
        groupBet.guid = uuid();
        groupBet.items = new Array<GroupBetItem>();
        groupBet.type = GroupBetType.PUBLIC;        

        return await groupBetRepo.save(groupBet);
    }

    public async getUserGroupBets(): Promise<Array<GroupBet>>{
        const groupBetRepo = getCustomRepository(GroupBetRepository);

        // TODO: Check Permissions

        return await groupBetRepo.getUserGroupBets();
    }

    public async getByName(name: string): Promise<GroupBet>{
        const groupBetRepo = getCustomRepository(GroupBetRepository);
        const groupBet = await groupBetRepo.searchByName(name.toLowerCase());
        
        // TODO: Check Permissions

        return Promise.resolve(groupBet);
    }

    public async getByGuid(guid: string, user: User): Promise<GroupBet>{
        const groupBetRepo = getCustomRepository(GroupBetRepository);
        const groupBet = await groupBetRepo.getUserGroupBetByUUID(guid);
        
        if(!groupBet){
            return Promise.reject("El grupo no existe.");
        }

        if(groupBet.items !== undefined){
            if(R.find(R.propEq('userGuid', user.guid))(groupBet.items) === undefined){
                return Promise.reject("El usuario no pertenece a este grupo.");
            }  
        }      

        return Promise.resolve(groupBet);
    }    

    public async joinPublicGroup(user: User, groupGuid: string): Promise<void>{
        const groupBetRepo = getCustomRepository(GroupBetRepository);
        const scoreRepo = getCustomRepository(ScoreRepository);        
        
        let groupBet = await groupBetRepo.getUserGroupBetByUUID(groupGuid);

        if(groupBet.type === GroupBetType.PRIVATE){
            return Promise.reject("El grupo que intentas acceder es privado.");
        }
                        
        await this.addMemberToGroupBet(user, groupBet);
        
        return Promise.resolve();
    }

    private async addMemberToGroupBet(user: User, groupBet: GroupBet){
        const groupBetRepo = getCustomRepository(GroupBetRepository);
        const scoreRepo = getCustomRepository(ScoreRepository);

        let validationPromise = new Promise(async (resolve, reject) => {
            if(groupBet.items == undefined){
                resolve();
            }
        
            groupBet.items.forEach((item: GroupBetItem) => {
                if(item.userGuid == user.guid){
                    reject("El usuario ya pertenece al grupo como miembro.");
                }
            });
        
            resolve();
        });
        
        return validationPromise.then(async () => {
            let groupBetItem = new GroupBetItem();
            groupBetItem.guid = uuid();
            groupBetItem.userGuid = user.guid;
            groupBetItem.user = user;
        
            let score = new Score();
            score.addUser(user);
            score.setPoints();
            score.setUUID(uuid());
            score.setGroup(groupBet);
        
            if(groupBet.items){
                groupBet.items.push(groupBetItem);                
            }
            else{
                groupBet.items = new Array<GroupBetItem>();
                groupBet.items.push(groupBetItem);
            }
        
            await groupBetRepo.save(groupBet);
            await scoreRepo.save(score);
        
            return Promise.resolve();
        })
        .catch((err) => {
            return Promise.reject("Fallo la unión al grupo: " + err);
        });         
    }

    public async requestAccessToGroup(user: User, groupGuid: string): Promise<void>{
        const groupBetReqRepo = getCustomRepository(GroupBetRequestRepository);
        const groupBetRepo = getCustomRepository(GroupBetRepository);
        const groupBet = await groupBetRepo.getUserGroupBetByUUID(groupGuid);
        const managerRepo = getCustomRepository(GroupManagerRepository);
        const userRepo = getCustomRepository(UserRepository);

        if(await groupBetReqRepo.getRequestByUserAndGroup(user.guid, groupGuid)){
            return Promise.reject("La invitación a este grupo ya ha sido enviada o se encuentra terminada.");
        }

        let groupBetManager = await managerRepo.getManagerByGroupGuid(groupGuid);

        if(!groupBetManager){
            return Promise.reject("No hay administradores para el grupo seleccionado.");
        }

        let request = new GroupBetRequest();
        request.setWaitingApproval();
        request.setGroupBetInfo(groupBet);
        request.setRequestorInfo(user);
        request.setManager(groupBetManager.userManager);
        request.setUUID(uuid());

        await groupBetReqRepo.save(request);

        return Promise.resolve();
    }

    public async approveAccessToGroup(user: User, requestGuid: string):  Promise<void>{
        const groupBetReqRepo = getCustomRepository(GroupBetRequestRepository);
        const groupBetRepo = getCustomRepository(GroupBetRepository);
        const scoreRepo = getCustomRepository(ScoreRepository);
        const managerRepo = getCustomRepository(GroupManagerRepository);
        const userRepo = getCustomRepository(UserRepository);       
        
        let request = await groupBetReqRepo.getRequestByGuid(requestGuid);

        if(!request){
            return Promise.reject("La invitación no esta disponible o no existe.");
        }

        if(!request.approver){
            return Promise.reject("No tenemos aprobadores disponibles para este grupo.");
        }

        if(!request.requestor){
            return Promise.reject("El usuario pidiendo acceso no existe.");            
        }

        if(request.approver.guid !== user.guid){
            return Promise.reject("El usuario no tiene permisos de administrador de grupo.");            
        }

        request.setApproved();

        await groupBetReqRepo.save(request);

        let group = await groupBetRepo.getUserGroupBetByUUID(request.requestGroup.guid);                
        let validationPromise = new Promise(async (resolve, reject) => {
            if(group.items == undefined){
                resolve();
            }
        
            group.items.forEach((item: GroupBetItem) => {
                if(item.userGuid == request.requestor.guid){
                    reject("El usuario ya pertenece al grupo como miembro.");
                }
            });
        
            resolve();
        });
        
        return validationPromise.then(async () => {
            let groupBetItem = new GroupBetItem();
            groupBetItem.guid = uuid();
            groupBetItem.userGuid = request.requestor.guid;
            groupBetItem.user = request.requestor;
        
            let score = new Score();
            score.addUser(request.requestor);
            score.setGroup(group);
            score.setPoints();
            score.setUUID(uuid());
        
            if(group.items){
                group.items.push(groupBetItem);                
            }
            else{
                group.items = new Array<GroupBetItem>();
                group.items.push(groupBetItem);
            }
        
            await groupBetRepo.save(group);
            await scoreRepo.save(score);
        
            return Promise.resolve();
        })
        .catch((err) => {
            return Promise.reject("Fallo la unión al grupo: " + err);
        });        
    }

    public async rejectAccessToGroup(user: User, requestGuid: string):  Promise<void>{
        const groupBetReqRepo = getCustomRepository(GroupBetRequestRepository);
        const groupBetRepo = getCustomRepository(GroupBetRepository);        
        let request = await groupBetReqRepo.getRequestByGuid(requestGuid);

        if(request.approver.guid !== user.guid){
            return Promise.reject("El usuario no es administrador de grupo y no puede realizar esta acción.");            
        }

        request.setRejected();

        await groupBetReqRepo.save(request);
    }

    public async getApprovedRequests(user: User): Promise<Array<UserInviteModel>>{
        const groupBetReqRepo = getCustomRepository(GroupBetRequestRepository);        
        const approvedInvites = await groupBetReqRepo.getApproved(user.guid);
        
        let invitesList = new Array<UserInviteModel>();
        let addInviteToList = (req: GroupBetRequest) => {
            let newInvite = new UserInviteModel();
            newInvite.groupName = req.requestGroup.name;
            newInvite.picture = req.requestor.picture;
            newInvite.username = req.requestor.getFullName() || req.requestor.emailAddress;
            newInvite.requestGuid = req.guid;
            invitesList.push(newInvite);
        }

        R.forEach(addInviteToList, approvedInvites);

        return invitesList;
    }

    public async getWaitingRequests(user: User): Promise<Array<UserInviteModel>>{
        const groupBetReqRepo = getCustomRepository(GroupBetRequestRepository);        
        const waitingList = await groupBetReqRepo.getWaiting(user.guid);
        
        let invitesList = new Array<UserInviteModel>();        
        let addInviteToList = (req: GroupBetRequest) => {
            let newInvite = new UserInviteModel();
            newInvite.groupName = req.requestGroup.name;
            newInvite.picture = req.requestor.picture;
            newInvite.username = req.requestor.getFullName() || req.requestor.emailAddress;
            newInvite.requestGuid = req.guid;
            invitesList.push(newInvite);
        }

        R.forEach(addInviteToList, waitingList);

        return invitesList;        
    }
    
    public async getRejectedRequests(user: User): Promise<Array<UserInviteModel>>{
        const groupBetReqRepo = getCustomRepository(GroupBetRequestRepository);
        const rejectedInvites = await groupBetReqRepo.getRejected(user.guid);

        let invitesList = new Array<UserInviteModel>();                
        let addInviteToList = (req: GroupBetRequest) => {
            let newInvite = new UserInviteModel();
            newInvite.groupName = req.requestGroup.name;
            newInvite.picture = req.requestor.picture;
            newInvite.username = req.requestor.getFullName() || req.requestor.emailAddress;
            newInvite.requestGuid = req.guid;
            invitesList.push(newInvite);
        }
        
        R.forEach(addInviteToList, rejectedInvites);

        return invitesList;
    }

    public async runImportProcess(): Promise<void>{
        const groupBetRepo = getCustomRepository(GroupBetRepository);
        const scoreRepo = getCustomRepository(ScoreRepository);
        const userRepo = getCustomRepository(UserRepository);

        console.log("Initiating Import Process... => ");

        // Retrieve all groups
        const groups = await groupBetRepo.getAll();

        // Foreach group, retrieve all userids joined
        const processGroup = (group: GroupBet) => {
            let userGuids = Array<string>();          
            
            // Get All UserIds
            const pusher = groupBetItem => userGuids.push(groupBetItem.userGuid);
            R.forEach(pusher, group.items);            

            // Remove Duplicates
            const uniqueUserGuids = R.uniq(userGuids);

            // Check if userGuids + groupGuid exists in score table
            const importProcess = async (userGuid) => {
                const user = await userRepo.getUserByGuid(userGuid);
                
                console.log("Processing user %s for group %s ... =>", userGuid, group.guid);

                if(!await scoreRepo.getScoreByUserAndGroup(user.guid, group.guid)){
                    let newScore = new Score();
                    newScore.setGroup(group);
                    newScore.addUser(user);
                    newScore.setPoints();
                    newScore.setUUID(uuid());

                    console.log("Adding user %s for group %s ... => ", userGuid, group.guid);                    
                                        
                    await scoreRepo.save(newScore);
                }
                else{
                    console.log("Avoiding user %s for group %s ... => ", userGuid, group.guid);                                        
                }
            };
            
            R.forEach(importProcess, uniqueUserGuids);
        }

        R.forEach(processGroup, groups);        

        console.log("Finishing import process ...");

        return Promise.resolve();
    }

    public async runImportManagerProcess(): Promise<void>{
        const managerRepo = getCustomRepository(GroupManagerRepository);
        const groupBetRepo = getCustomRepository(GroupBetRepository);
        const userRepo = getCustomRepository(UserRepository);

        console.log("Initiating Process...");
        
        // Get All Groups
        let groups = await groupBetRepo.getAll();

        console.log("Processing %s groups ...", groups.length);

        let processGroup = async (group: GroupBet) => {

            console.log("Processing %s group with %s members ...", group.name, group.items.length);

            // Take first (creator)
            let headItem: GroupBetItem = R.head(group.items);
            
            if(!await managerRepo.getManagerByGroupGuid(group.guid)){
                let user = await userRepo.getUserByGuid(headItem.userGuid);

                // Add to managers table
                let groupManager = new GroupBetManager();
                groupManager.guid = uuid();
                groupManager.userManager = user;
                groupManager.managingGroupBet = group;              

                // Save
                await managerRepo.save(groupManager);
            }
            else{
                console.log("Avoiding %s group ...", group.name);
            }
        }

        R.forEach(processGroup, groups);
    }

    public async runImportUsersProcess():Promise<void>{
        const groupBetRepo = getCustomRepository(GroupBetRepository);
        const userRepo = getCustomRepository(UserRepository);
        
        console.log("Initiating Import Process... => ");
        
        // Retrieve all groups
        const groups = await groupBetRepo.getAll();       
        
        // Add user reference to each group member
        const processGroup = async (group: GroupBet) => {

            console.log("Processing %s group ... => ", group.name);

            const processItem = async (item: GroupBetItem) => {
                const user = await userRepo.getUserByGuid(item.userGuid);
                item.user = user;

                await groupBetRepo.save(group);
            };

            // Add users to items
            R.forEach(processItem, group.items);            
        };

        R.forEach(processGroup, groups);
    }

    public async getUserGroups(user: User): Promise<Array<GroupBet>>{
        const groupBetRepo = getCustomRepository(GroupBetRepository);

        // TODO: Check Permissions

        return await groupBetRepo.getUserGroupBetByUserGuid(user.guid);
    }

    public async getPublicGroups(user: User): Promise<PublicGroupListModel>{
        const groupBetRepo = getCustomRepository(GroupBetRepository);
        const publicGroups = await groupBetRepo.getPublicUserGroupBets();
        const joinedGroupGuidList = new Array<string>();

        let model = new PublicGroupListModel();
        let verifyIsJoined = (groupBet: GroupBet) => {
            let verifyIsItem = (item: GroupBetItem) => {
                if(item.userGuid === user.guid){
                    joinedGroupGuidList.push(groupBet.guid);
                }
            }
        
            if(groupBet.items){
                R.forEach(verifyIsItem, groupBet.items);                
            }
        };

        R.forEach(verifyIsJoined, publicGroups);

        model.joinedGroupGuidList = joinedGroupGuidList;
        model.publicGroups = publicGroups;
        
        return Promise.resolve(model);
    }

    public async quickLinkJoin(user: User, groupGuid: string): Promise<void>{
        const groupBetRepo = getCustomRepository(GroupBetRepository);
        const scoreRepo = getCustomRepository(ScoreRepository);        
        
        let groupBet = await groupBetRepo.getUserGroupBetByUUID(groupGuid);

        if(groupBet.type === GroupBetType.PUBLIC){
            return Promise.reject("El grupo que intentas acceder es público.");
        }
                        
        await this.addMemberToGroupBet(user, groupBet);
        
        return Promise.resolve();        
    }
}
