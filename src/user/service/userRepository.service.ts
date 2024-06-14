import { HttpException, HttpStatus, Logger,Injectable } from "@nestjs/common";
import { DBClient } from "src/core/db/dbclient.service";
import { UserContext } from "src/core/userContext.payload";
import { User } from "../models/user.model";

@Injectable()
export class UserRepositoryservice{
    constructor(
        private readonly dbClient: DBClient,
        private logger: Logger,
    ){}

    // check if user already exists
    async isUserExists(userContext: UserContext):Promise<boolean>{
        try {
            const userContext = {
                userId: 'app1',
                employeeId: "1234",
                namespace: "app1",
                roles: [],
                roleIds:[]
    
            }
             if(await this.findUserByLoginId('app1', null, userContext.employeeId)){
                 return true;
             }else{
                return false;
             }
        } catch (error) {
            throw new HttpException(`error finding user with userID ${userContext.employeeId} ${error}`, HttpStatus.INTERNAL_SERVER_ERROR)
            
        }
    }


    // find users by email or employee id
    async findUserByLoginId(namespace: string, loginId?: string, employeeId?: string): Promise<User> {
        try {
            this.logger.log("Calling find users by email or employee id................................................................");
            const manager = await this.dbClient.getEntityManager('app1');
            if(loginId !== null){
                const user = await manager.createQueryBuilder(User, "user")
                    .where("LOWER(user.loginId) = :loginId", { loginId: loginId.toLowerCase() })
                    .getOne();
                return user;
            }else if(employeeId){
                const user = await manager.createQueryBuilder(User, "user")
                .where("LOWER(user.employeeId) =:employeeId", { employeeId: employeeId.toLowerCase() })
                .getOne();
            return user;
            }
        } catch (error) {
            throw new HttpException(`error finding user ${error}`, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}