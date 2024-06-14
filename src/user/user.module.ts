import { Logger, Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './user.controller';
import { DBClient } from 'src/core/db/dbclient.service';
import { UserRepositoryservice } from './service/userRepository.service';
import { CachingUtil } from 'src/core/utils/caching.util';
import { HashingUtil } from 'src/core/utils/hashing.util';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { BlackListTokenService } from 'src/auth/services/blackListToken.service';


@Module({
  imports: [],
  providers: [UserService, DBClient, Logger,UserRepositoryservice,CachingUtil, HashingUtil, AuthService, JwtService, BlackListTokenService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
