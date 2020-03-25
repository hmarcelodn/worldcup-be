// TypeORM
import { getCustomRepository } from "typeorm";
import { Service } from "typedi";
import * as Guid from 'guid';
import * as CryptoJS from "crypto-js";
import * as jwt from "jsonwebtoken";
import * as uuid from "uuid/v4";
import * as PasswordValidator from "password-validator";
import * as fs from "fs";
import * as googleJWT from "connect-google-jwt";
import * as path from "path";

// Local Deps
import { User } from "../entity/User";
import { UserRepository } from "../repository/UserRepository";
import { CreateUserModel } from "../model/CreateUserModel";
import { LoginModel } from "../model/LoginModel";
import { TokenResponse } from "../model/TokenResponse";
import { ExternalLoginModel } from "../model/ExternalLoginModel";

@Service()
export class UserService{
    public async createUser(model: CreateUserModel): Promise<any>{
        let userRepository: UserRepository = getCustomRepository(UserRepository);

        if(!(await userRepository.getExistByEmailAddress(model.emailAddress.toLowerCase()))){
            let user: User = new User();
            let schema = new PasswordValidator();

            // Set Password Policy
            schema.is().min(8)
                  .is().max(25)
                  .has().uppercase()
                  .has().lowercase()
                  .has().digits()
                  .has().not().spaces();

            // Check Password Policy
            if(!schema.validate(model.password)){
                return {
                    status: "Invalid Password Policy. Include Uppercase/Lowercase/Digits/8-25 Characters."
                }
            }

            user.setEmailAddress(model.emailAddress);
            user.setFirstName(model.firstName);
            user.setUserName(model.userName);
            user.setLastName(model.lastName);
            user.enable();
            user.setInternal();
            user.guid = uuid();
    
            // AES Encription
            const encryptedPassword = CryptoJS.AES.encrypt(model.password, "worldcup-aes");    
            user.setPassword(encryptedPassword.toString());            
                
            await userRepository.save(user);

            return {
                status: "succeded"
            }
        }
        else{
            throw {
                status: "already exist"
            };
        }
    }

    public async login(model: LoginModel): Promise<TokenResponse>{        
        const userRepository = getCustomRepository(UserRepository)
        const user: User = await userRepository.getByEmailAddress(model.email);

        if(!user){
            return new TokenResponse(null, false, "Invalid Credentials.");
        }
        
        if(!user.isEnabled()){
            return new TokenResponse(null, false, "User is disabled in blacklist.");
        }                

        // AES Decryption
        const decryptedIntendedPassword = CryptoJS.AES.decrypt(user.password, "worldcup-aes");
                
        if(model.password !== decryptedIntendedPassword.toString(CryptoJS.enc.Utf8)){
            user.sumAttemps();
            
            if(user.attemps === 3){
                user.disable();
            }

            await userRepository.save(user);
            
            return new TokenResponse(null, false, "Invalid Credentials.");
        }
        
        const payload = {
            email: user.emailAddress,
            uuid: user.guid
        };
        
        let token:string = jwt.sign(payload, "worldcup-aes", {
            expiresIn: "80h"//1440
        });
        
        user.setCurrentToken(token);
                
        await userRepository.save(user);
        
        return new TokenResponse(token, true, "Success");
    }

    public async externalLogin(model: ExternalLoginModel, type: string):Promise<TokenResponse>{
        const userRepository = getCustomRepository(UserRepository) 

        // Register User
        let user: User = await userRepository.getExternalByEmailAddress(model.email, type);
        
        if(!user){
            let newUser = new User();
            newUser.enable();
            newUser.setEmailAddress(model.email.toLowerCase());
            newUser.setFirstName(model.firstName);
            newUser.setLastName(model.lastName);
            newUser.setPassword(null);         
            newUser.setProvider(type);
            
            newUser.guid = uuid();
            newUser.picture = model.picture;

            user = await userRepository.save(newUser);
        }        

        // Login
        const payload = {
            email: user.emailAddress,
            uuid: user.guid
        };

        let token:string = jwt.sign(payload, "worldcup-aes", {
            expiresIn: "80h"//1440
        });

        user.picture = model.picture;
        user.setCurrentToken(token);
        
        await userRepository.save(user);        

        return new TokenResponse(token, true, "Success");
    }
}