import { ExtractJwt, Strategy, JwtFromRequestFunction } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CachingUtil } from 'src/core/utils/caching.util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private readonly cachingUtil: CachingUtil,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          if (!request || !request.headers || !request.headers.authorization) {
            return null;
          }
          const token = request.headers.authorization.split(' ')[1];
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET,
      secretOrPrivateKey: process.env.JWT_ACCESS_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(request: any, payload: any) {
    return payload;
  }
}
