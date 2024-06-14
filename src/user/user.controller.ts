import {
  Body,
  Controller,
  HttpException,
  Post,
  Req,
  UseGuards,
  Res,
  Get,
} from '@nestjs/common';
import { UserService } from './service/user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { UserLoginDto } from './dto/userLogin.dto';
import { LoginResponse } from 'src/user/types/loginResponse.type';
import { generatePdfFromHtml, generateExcelFile } from 'src/core/utils/htmlToPdf.util';

// @UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // create a new user ----only admin-----
  @Post('create')
  // @UseGuards(JwtAuthGuard)
  async createUser(@Body() userDetails: CreateUserDto, @Req() req: any) {
    try {
      const userContext = {
        userId: 'app1',
        employeeId: '1234',
        namespace: 'app1',
        roles: [],
        roleIds: [],
      };
      return await this.userService.createUser(userContext, userDetails);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
  @Post('login')
  // @UseGuards(JwtAuthGuard)
  async userLogin(
    @Body() userDetails: UserLoginDto,
    @Req() req: any,
    @Res() res: any,
  ): Promise<LoginResponse> {
    try {
      const userContext = {
        userId: 'app1',
        employeeId: '1234',
        namespace: 'app1',
        roles: [],
        roleIds: [],
      };
      const response: LoginResponse = await this.userService.login(
        userContext,
        userDetails,
      );
      const { accessToken, refreshToken } = response;

      // Set cookies for access token and refresh token
      // res.cookie('accessToken', accessToken, {
      //   httpOnly: true, // Ensures the cookie is not accessible via JavaScript
      //   secure: process.env.NODE_ENV === 'production', // Ensures the cookie is only sent over HTTPS in production
      //   sameSite: 'strict', // CSRF protection
      // });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return res.json({success: true, statusCode: 200, data:{accessToken: accessToken}});
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
  @Get('report')
  // @UseGuards(JwtAuthGuard)
  async genertereport(
  
  ): Promise<any> {
    try {
     return await generateExcelFile();
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
