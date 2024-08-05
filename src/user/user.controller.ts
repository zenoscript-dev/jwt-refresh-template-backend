import {
  Body,
  Controller,
  HttpException,
  Post,
  Req,
  UseGuards,
  Res,
  Get,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './service/user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { UserLoginDto } from './dto/userLogin.dto';
import { LoginResponse } from 'src/user/types/loginResponse.type';
import {
  generatePdfFromHtml,
  generateExcelFile,
} from 'src/core/utils/htmlToPdf.util';

// @UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // create a new user ----only admin-----
  @Post('create')
  // @UseGuards(JwtAuthGuard)
  async createUser(@Body() userDetails: CreateUserDto, @Req() req: any) {
    try {
      return await this.userService.createUser(userDetails);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
  @Post('login')
  // @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async userLogin(
    @Body() userDetails: UserLoginDto,
    @Req() req: any,
    @Res() res: any,
  ): Promise<LoginResponse> {
    try {
      const response: LoginResponse = await this.userService.login(userDetails);
      const { accessToken, refreshToken } = response;
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return res.json({ success: true });
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
  @Get('report')
  // @UseGuards(JwtAuthGuard)
  async genertereport(): Promise<any> {
    try {
      return await generateExcelFile();
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
