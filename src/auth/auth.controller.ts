import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { JwtAuthGuard } from './guards/jwtAuth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Refresh token endpoint
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

    // Set the refresh token in an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    return accessToken;
  }

  // Endpoint to get the access token
  @Get('me')
  async getAccessToken(@Req() req: any, @Res() res: any) {
    const refreshTokenFromClient = req.cookies.refreshToken;
    if (!refreshTokenFromClient) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const { accessToken, refreshToken, userId } =
      await this.authService.validateRefreshFromCookie({ refreshToken: refreshTokenFromClient });

    // Update the refresh token in the HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    return {accessToken, userId};
  }
}
