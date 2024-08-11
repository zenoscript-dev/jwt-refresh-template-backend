import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
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
import { In, Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { fileType } from '../types/file.type';

@Injectable()
export class UserService {
  constructor(
    private logger: Logger,
    private readonly hashingUtil: HashingUtil,
    private readonly authService: AuthService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @Inject('MINIO_SERVICE') private readonly minioClient: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.minioClient.connect();
      console.log('connected to minio service successfully');
    } catch (error) {
      console.error('Error connecting to minio:', error);
    }
  }

  async createUser(createUserDto: CreateUserDto, profilePic?: any): Promise<Object> {
    this.logger.log('Calling create user api.................>');
    try {
      // Validate email
      if (!Util.checkEmailValidation(createUserDto.loginId)) {
        throw new HttpException('Invalid email', HttpStatus.BAD_REQUEST);
      }

      // Validate password
      if (createUserDto.password) {
        const passwordValidationMsg = Util.checkPasswordValidation(createUserDto.password);
        this.logger.log('passwordValidationMsg .. ' + passwordValidationMsg, UserService.name);

        if (passwordValidationMsg) {
          throw new HttpException(passwordValidationMsg, HttpStatus.BAD_REQUEST);
        }
      }

      // Check if user already exists.
      const userExists = await this.isUserExists(createUserDto.loginId);
      if (userExists) {
        this.logger.log('user already exists ---------------------->');
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }

      const saltRounds = 10; // You can adjust the number of salt rounds as needed
      const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

      // Create user
      const newUser = this.userRepo.create({
        ...createUserDto,
        password: hashedPassword,
      });

      // Save user before uploading profile picture to get the user ID
      await this.userRepo.save(newUser);

      // Handle profile picture upload if provided
      if (profilePic) {
        const uploadedImageDetails = await this.uploadProfilePicture({
          profilePic,
        }, newUser.id);

        // Update the user with the profile picture URL or path after uploading
        if (uploadedImageDetails) {
          newUser.profilepic = uploadedImageDetails; // Assuming the returned object has a 'url' property
          await this.userRepo.save(newUser);
        }
      }

      this.logger.log('User created successfully------------------------>');

      return new SuccessResponse<User>('User created successfully', HttpStatus.OK, newUser);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async login(userLoginDto: UserLoginDto): Promise<LoginResponse> {
    this.logger.log('Calling user login api.................>');

    try {
      // Check if user exists with the employee id
      const userDetails = await this.userRepo.findOne({
        where: { loginId: userLoginDto.loginId },
      });

      if (!userDetails) {
        throw new HttpException('Invalid login credentials.', HttpStatus.UNAUTHORIZED);
      }

      // Check if password is correct
      const isPasswordMatched = await bcrypt.compare(userLoginDto.password, userDetails.password);
      if (!isPasswordMatched) {
        throw new HttpException('Invalid login credentials.', HttpStatus.UNAUTHORIZED);
      }

      // Generate JWT token
      const newUserToken = new UserTokenPayload();
      newUserToken.id = userDetails.id;
      const token = await this.authService.generateJWTTokenWithRefresh(newUserToken);

      return {
        userId: userDetails.id,
        accessToken: token['accessToken'],
        refreshToken: token['refreshToken'],
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async isUserExists(loginId: string): Promise<boolean> {
    try {
      const userExists = await this.userRepo.findOne({
        where: { loginId: loginId },
      });
      return !!userExists;
    } catch (error) {
      throw new HttpException(
        `Error finding user with login ID ${loginId}: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findUserByLoginId(namespace: string, loginId?: string, employeeId?: string): Promise<User> {
    try {
      this.logger.log('Calling find users by email or employee id................................................................');

      if (loginId) {
        const user = await this.userRepo
          .createQueryBuilder('user')
          .where('LOWER(user.loginId) = :loginId', { loginId: loginId.toLowerCase() })
          .getOne();
        return user;
      } else if (employeeId) {
        const user = await this.userRepo
          .createQueryBuilder('user')
          .where('LOWER(user.employeeId) =:employeeId', { employeeId: employeeId.toLowerCase() })
          .getOne();
        return user;
      }
    } catch (error) {
      throw new HttpException(`Error finding user: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserDetails(userId: string[]):Promise<User[]>{
    try {
      const user = await this.userRepo.createQueryBuilder('user')
      .where("user.id IN (:...userIds)", {userIds: userId})
      .select(["user.userName", "user.profilepic"])
      .getMany()
      console.log(user);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      throw new HttpException(`Error finding user: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async uploadProfilePicture(fileDetails: any, userId: string) {
    try {
      const response = await this.minioClient.send("image-upload", {
        file: fileDetails.profilePic,
        userId: userId,
      }).toPromise();

      return response.image_url;
    } catch (error) {
      console.error("Error uploading profile picture: ", error);
      throw new HttpException('Error uploading profile picture', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
