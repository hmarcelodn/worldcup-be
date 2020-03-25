export class TokenResponse{
    
    constructor (token: string, success: boolean, message: string){
        this.token = token;
        this.success = success;
        this.message = message;
    }
    
    public token: string;
    public success: boolean;
    public message: string;
}    