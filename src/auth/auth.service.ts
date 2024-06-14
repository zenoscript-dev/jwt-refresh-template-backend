import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { CachingUtil } from 'src/core/utils/caching.util';
import { UserTokenPayload } from './types/userToken.payload';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { BlackListTokenService } from './services/blackListToken.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cachingUtil: CachingUtil,
    private readonly blackListService: BlackListTokenService,
  ) {}

  async onModuleInit() {
    // You may want to retrieve the namespace dynamically if necessary.
    const namespace = 'app1'; // replace with your namespace
    await this.blackListService.syncBlacklistWithRedis(namespace);
  }

  // generate jwt token
  async generateJWTTokenWithRefresh(
    userTokenPayload: UserTokenPayload,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const accessToken = await this.jwtService.signAsync(
        { ...userTokenPayload },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
        },
      );
      const refreshToken = await this.jwtService.signAsync(
        { ...userTokenPayload },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
        },
      );

      // await this.cachingUtil.setCache(userTokenPayload.id, signedJwt, Number(process.env.JWT_EXPIRES_IN));
      return { accessToken: accessToken, refreshToken: refreshToken };
    } catch (error) {
      throw new Error('unable to generate jwt token');
    }
  }

  async generateJWT(userId: string) {
    try {
      const accessToken = await this.jwtService.signAsync(
        { userId: userId },
        { secret: process.env.JWT_EXPIRES_IN },
      );
    } catch (error) {}
  }

  // new f=refresh token

  async refreshToken(
    refreshTokenFromClient: RefreshTokenDto,
    userDetails?: any,
  ) {
    try {
      // check if its a blacklisted token or not
      const isTokenBlacklisted = await this.blackListService.isTokenBlacklisted(
        refreshTokenFromClient.refreshToken,
        userDetails.namespace,
      );

      if (isTokenBlacklisted) {
        throw new HttpException(
          'session expired.Please login again!',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const istokenValid = await this.jwtService.verify(
        refreshTokenFromClient.refreshToken,
        { secret: process.env.JWT_REFRESH_SECRET },
      );
      if (istokenValid) {
        const userTokenPayload = new UserTokenPayload();
        userTokenPayload.id = userDetails.id;
        userTokenPayload.roles = userDetails.roles;
        userTokenPayload.namespace = userDetails.namespace;

        // generate accessToken and refresh token pair
        const { accessToken, refreshToken } =
          await this.generateJWTTokenWithRefresh(userTokenPayload);

        // add refresh token to the blacklist
        const tokenToBlackList = await this.blackListService.blacklistToken(
          refreshTokenFromClient.refreshToken,
          Number(process.env.REFRESH_EXPIRY),
          userDetails.namespace,
        );
        return { accessToken: accessToken, refreshToken: refreshToken };
      }
    } catch (error) {
      // console.log(error)
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }
  async validateRefreshFromCookie(refreshTokenFromClient: RefreshTokenDto) {
    try {
      // Decode the token to extract user details
      const userDetailsFromToken = this.jwtService.decode(
        refreshTokenFromClient.refreshToken,
      );

      if (!userDetailsFromToken || typeof userDetailsFromToken === 'string') {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }

      const userDetails = userDetailsFromToken as any; // Cast to any or a specific type if you have one
      console.log(userDetails)

      // Check if the token is blacklisted
      const isTokenBlacklisted = await this.blackListService.isTokenBlacklisted(
        refreshTokenFromClient.refreshToken,
        userDetails.namespace,
      );

      console.log(isTokenBlacklisted)

      if (isTokenBlacklisted) {
        throw new HttpException(
          'Session expired. Please login again!',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Verify the token to ensure it's valid
      const isTokenValid = await this.jwtService.verifyAsync(
        refreshTokenFromClient.refreshToken,
        { secret: process.env.JWT_REFRESH_SECRET },
      );

      if (isTokenValid) {
        const userTokenPayload = new UserTokenPayload();
        userTokenPayload.id = userDetails.id;
        userTokenPayload.roles = userDetails.roles;
        userTokenPayload.namespace = userDetails.namespace;

        // Generate new access and refresh tokens
        const { accessToken, refreshToken } =
          await this.generateJWTTokenWithRefresh(userTokenPayload);

        // Add the old refresh token to the blacklist
        const tokenToBlackList = await this.blackListService.blacklistToken(
          refreshTokenFromClient.refreshToken,
          Number(process.env.REFRESH_EXPIRY),
          userDetails.namespace,
        );
        return { accessToken, refreshToken };
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }
}
