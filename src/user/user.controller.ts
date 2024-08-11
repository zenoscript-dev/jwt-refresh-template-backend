import {
  Body,
  Controller,
  HttpException,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  Get,
} from '@nestjs/common';
import { UserService } from './service/user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UserLoginDto } from './dto/userLogin.dto';
import { LoginResponse } from 'src/user/types/loginResponse.type';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from './models/user.model';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('profilePic')) // Handle file upload
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() profilePic: any,
    @Req() req: any
  ) {


    try {
      if (profilePic) {
        if(profilePic){
          return await this.userService.createUser(createUserDto, profilePic);
        }else{
          return await this.userService.createUser(createUserDto);
        }
      //   createUserDto.profilePic = {
      //     buffer: profilePic.buffer,
      //     mimetype: profilePic.mimetype,
      //     filename: profilePic.originalname,
      //   };
      // }
      // console.log(createUserDto);

      // return await this.userService.createUser(createUserDto);
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  
  @Post('login')
  @HttpCode(200)
  async userLogin(
    @Body() userDetails: UserLoginDto,
    @Req() req: any,
    @Res() res: any,
  ): Promise<LoginResponse> {
    try {
      const response: LoginResponse = await this.userService.login(userDetails);
      const { accessToken, refreshToken, userId } = response;
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return res.json({ success: true, statusCode: 200, accessToken, userId });
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @EventPattern("user-details")
  async getUserDetails(@Payload() userId: string[]):Promise<User[]>{
    return await this.userService.getUserDetails(userId);
  }

}
