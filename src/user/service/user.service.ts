import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from '../dto/createUser.dto';
import { DBClient } from 'src/core/db/dbclient.service';
import { UserContext } from 'src/core/userContext.payload';
import * as Util from '../../core/utils/utilites.util';
import { UserRepositoryservice } from './userRepository.service';
import { User } from '../models/user.model';
import { SuccessResponse } from 'src/core/responses/success.response';
import { HashingUtil } from 'src/core/utils/hashing.util';
import { UserLoginDto } from '../dto/userLogin.dto';
import * as bcrypt from 'bcrypt';
import { LoginResponse } from 'src/user/types/loginResponse.type';
import { AuthService } from 'src/auth/auth.service';
import { UserTokenPayload } from 'src/auth/types/userToken.payload';





@Injectable()
export class UserService {
  constructor(
    private dbClient: DBClient,
    private logger: Logger,
    private userRepositoryService: UserRepositoryservice,
    private readonly hashingUtil: HashingUtil,
    private readonly authService: AuthService,
  ) {}

  // Define LoginResponse interface (optional but recommended for type safety)


  async createUser(
    userContext: UserContext,
    createUserDto: CreateUserDto,
  ): Promise<Object> {
    this.logger.log('Calling create user api.................>');
    try {
      // validate email
      if (!Util.checkEmailValidation(createUserDto.loginId)) {
        throw new HttpException('Invalid email', HttpStatus.BAD_REQUEST);
      }

      //   validate passwor
      if(createUserDto.password){

        const passwordValidationMsg = Util.checkPasswordValidation(
          createUserDto.password,
        );
        this.logger.log(
          'passwordValidationMsg .. ' + passwordValidationMsg,
          UserService.name,
        );
  
        if (passwordValidationMsg) {
          throw new HttpException(passwordValidationMsg, HttpStatus.BAD_REQUEST);
        }
      }

      // check if user already exists.
      const userExists =
        await this.userRepositoryService.isUserExists(userContext);
      if (userExists) {
        this.logger.log('user already exists ---------------------->');
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }

      // generate and hash password before saving user.
      const hashedPassword = await this.hashingUtil.generateHashedPassword();
      console.log(hashedPassword)

      // create user
      const manager = await this.dbClient.getEntityManager('app1');
      const newUser = manager.create(User, {
        ...createUserDto,
        password: hashedPassword['hashedPassword'],
        createdBy: userContext.userId,
      });
      await manager.save(newUser);
      this.logger.log('user created succesfully------------------------>');

      return new SuccessResponse<User>(
        'User created successfully',
        HttpStatus.OK,
        newUser,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
  async login(
    userContext: UserContext,
    userLoginDto: UserLoginDto,
  ): Promise<LoginResponse> {
    this.logger.log('Calling create user api.................>');
   
    try {
      const manager = await this.dbClient.getEntityManager('app1');
      
      // check if user exists with the employee id
      const userDetails =await manager.createQueryBuilder(User, 'u')
      .where("u.employeeId = :employeeId", {employeeId: userLoginDto.employeeId}).getOne();
      if(!userDetails){
        throw new HttpException("Invalid login credentials.", HttpStatus.UNAUTHORIZED)
      }
      console.log(userDetails.password)

      // check if password is correct
      const isPasswordMatched = await bcrypt.compare(userLoginDto.password,userDetails.password);
      if(!isPasswordMatched){
        throw new HttpException("Invalid login credentials.", HttpStatus.UNAUTHORIZED)
      }

      // generate jwt token
      const newUserToken = new UserTokenPayload();
      newUserToken.id = userDetails.id;
      newUserToken.namespace = userContext.namespace;
      newUserToken.roles = [];
      const token = await this.authService.generateJWTTokenWithRefresh(newUserToken);


      return {
        employeeId: userDetails.employeeId,
        accessToken: token['accessToken'],
        refreshToken: token['refreshToken']
      };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
