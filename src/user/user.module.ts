import { Logger, Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './user.controller';
import { CachingUtil } from 'src/core/utils/caching.util';
import { HashingUtil } from 'src/core/utils/hashing.util';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { BlackListTokenService } from 'src/auth/services/blackListToken.service';
import { BlackListedTokens } from 'src/auth/models/blackListTokens.model';
import { User } from './models/user.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from 'src/app.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [TypeOrmModule.forFeature([User, BlackListedTokens]), ClientsModule.register([
    { 
      name: 'MINIO_SERVICE', 
      transport: Transport.TCP, 
      options: { host: "localhost", port: 5000 }, // Add the correct host and port here
    },
  ]),],
  providers: [
    UserService,
    Logger,
    CachingUtil,
    HashingUtil,
    AuthService,
    JwtService,
    BlackListTokenService,
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
