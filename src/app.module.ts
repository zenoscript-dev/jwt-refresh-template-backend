import { Module, Logger } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';
import ormConfig, { getDatabaseNamespaceIds } from './config/orm.config';
import type { RedisClientOptions } from 'redis';
import { UserModule } from './user/user.module';


// database connections for each tenant

console.log(getDatabaseNamespaceIds(), "asdasddas")
const databasesConfig = getDatabaseNamespaceIds().map((tenantId) => {
  return TypeOrmModule.forRootAsync({
    name: `database-${tenantId}`,
    imports: [ConfigModule.forFeature(ormConfig)],
    useFactory: (config: ConfigService) => config.get(`orm.${tenantId}`),
    inject: [ConfigService],
  });
});

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}),...databasesConfig, CacheModule.register({
    isGlobal: true,
    store: redisStore,
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT) || 6379,
  }),AuthModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
