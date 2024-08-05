import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthPayloadDto } from './dto/auth.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // refresh token
  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: any,
    @Res() res: any,
  ) {
    const userDetails = req.user;
    const response = await this.authService.refreshToken(
      refreshTokenDto,
      userDetails,
    );
    const { accessToken, refreshToken } = response;

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return res.json({
      success: true,
      statusCode: 200,
      data: {
        accessToken: accessToken,
      },
    });
  }

  @Get('me')
  async getAccessToken(@Req() req: any, @Res() res: any) {
    const refreshTokenFromClient = req.cookies.refreshToken;
    if (!refreshTokenFromClient) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const { accessToken, refreshToken } =
      await this.authService.validateRefreshFromCookie(req.cookies);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return res.json({
      success: true,
      statusCode: 200,
      data: {
        accessToken: accessToken,
      },
    });
  }
}
