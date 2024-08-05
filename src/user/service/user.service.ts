import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from '../dto/createUser.dto';
import { UserContext } from 'src/core/userContext.payload';
import * as Util from '../../core/utils/utilites.util';
import { User } from '../models/user.model';
import { SuccessResponse } from 'src/core/responses/success.response';
import { HashingUtil } from 'src/core/utils/hashing.util';
import { UserLoginDto } from '../dto/userLogin.dto';
import * as bcrypt from 'bcrypt';
import { LoginResponse } from 'src/user/types/loginResponse.type';
import { AuthService } from 'src/auth/auth.service';
import { UserTokenPayload } from 'src/auth/types/userToken.payload';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    private logger: Logger,
    private readonly hashingUtil: HashingUtil,
    private readonly authService: AuthService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // Define LoginResponse interface (optional but recommended for type safety)

  async createUser(createUserDto: CreateUserDto): Promise<Object> {
    this.logger.log('Calling create user api.................>');
    try {
      // validate email
      if (!Util.checkEmailValidation(createUserDto.loginId)) {
        throw new HttpException('Invalid email', HttpStatus.BAD_REQUEST);
      }

      //   validate passwor
      if (createUserDto.password) {
        const passwordValidationMsg = Util.checkPasswordValidation(
          createUserDto.password,
        );
        this.logger.log(
          'passwordValidationMsg .. ' + passwordValidationMsg,
          UserService.name,
        );

        if (passwordValidationMsg) {
          throw new HttpException(
            passwordValidationMsg,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // check if user already exists.
      const userExists = await this.isUserExists(createUserDto.loginId);
      if (userExists) {
        this.logger.log('user already exists ---------------------->');
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }

      const saltRounds = 10; // You can adjust the number of salt rounds as needed
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        saltRounds,
      );

      // create user
      const newUser = this.userRepo.create({
        ...createUserDto,
        password: hashedPassword,
      });
      await this.userRepo.save(newUser);
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
  async login(userLoginDto: UserLoginDto): Promise<LoginResponse> {
    this.logger.log('Calling user login api.................>');

    try {
      // check if user exists with the employee id
      const userDetails = await this.userRepo.findOne({
        where: { loginId: userLoginDto.loginId },
      });
      if (!userDetails) {
        throw new HttpException(
          'Invalid login credentials.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // check if password is correct
      const isPasswordMatched = await bcrypt.compare(
        userLoginDto.password,
        userDetails.password,
      );
      if (!isPasswordMatched) {
        throw new HttpException(
          'Invalid login credentials.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // generate jwt token
      const newUserToken = new UserTokenPayload();
      newUserToken.id = userDetails.id;
      newUserToken.roles = [];
      const token =
        await this.authService.generateJWTTokenWithRefresh(newUserToken);

      return {
        employeeId: userDetails.employeeId,
        accessToken: token['accessToken'],
        refreshToken: token['refreshToken'],
      };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async isUserExists(loginId: string): Promise<boolean> {
    try {
      const userExists = await this.userRepo.findOne({
        where: { loginId: loginId },
      });
      if (userExists) {
        return true;
      }
      return false;
    } catch (error) {
      throw new HttpException(
        `error finding user with userID ${loginId} ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // find users by email or employee id
  async findUserByLoginId(
    namespace: string,
    loginId?: string,
    employeeId?: string,
  ): Promise<User> {
    try {
      this.logger.log(
        'Calling find users by email or employee id................................................................',
      );
      if (loginId !== null) {
        const user = await this.userRepo
          .createQueryBuilder('user')
          .where('LOWER(user.loginId) = :loginId', {
            loginId: loginId.toLowerCase(),
          })
          .getOne();
        return user;
      } else if (employeeId) {
        const user = await this.userRepo
          .createQueryBuilder('user')
          .where('LOWER(user.employeeId) =:employeeId', {
            employeeId: employeeId.toLowerCase(),
          })
          .getOne();
        return user;
      }
    } catch (error) {
      throw new HttpException(
        `error finding user ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
