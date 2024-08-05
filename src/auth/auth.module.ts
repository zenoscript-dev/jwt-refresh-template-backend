import { Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CachingUtil } from 'src/core/utils/caching.util';
import { BlackListTokenService } from './services/blackListToken.service';
import { BlackListedTokens } from './models/blackListTokens.model';
import { TypeOrmModule } from '@nestjs/typeorm';

const passportModule = PassportModule.register({
  defaultStrategy: '',
});

@Module({
  imports: [
    TypeOrmModule.forFeature([BlackListedTokens]),
    PassportModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    CachingUtil,
    Logger,
    BlackListTokenService,
    BlackListedTokens,
  ],
  exports: [passportModule],
})
export class AuthModule {}
