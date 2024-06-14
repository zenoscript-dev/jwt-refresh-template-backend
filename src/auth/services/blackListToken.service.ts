import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlackListedTokens } from '../models/blackListTokens.model';
import { CachingUtil } from 'src/core/utils/caching.util';
import { DBClient } from 'src/core/db/dbclient.service';


@Injectable()
export class BlackListTokenService {
  constructor(
    private cachingUtil: CachingUtil,
    private readonly dbClient: DBClient,
    private logger: Logger
  ) {}

  async blacklistToken(token: string, expiresIn: number, namespace: string) {
    this.logger.log("calling token blacklisting method ---------------->")

    try {
      const manager = await this.dbClient.getEntityManager(namespace);
      await this.cachingUtil.setCache(token, JSON.stringify({ token }), expiresIn);


      // Also save to the database
      const blackListedToken = new BlackListedTokens();
      blackListedToken.token = token;
      blackListedToken.expiresAt = new Date(Date.now() + expiresIn * 1000);
      const newBlacklistedToken = manager.create(BlackListedTokens, blackListedToken)
      await manager.save(newBlacklistedToken);
    } catch (error) {
      this.logger.log("unable to blacklist token ---------------->")
      throw new Error(error)
    }
  }

  async isTokenBlacklisted(token: string, namespace: string): Promise<boolean> {
    try {
    this.logger.log("checking whether token is blacklisted or not ---------------->")
    const result = await this.cachingUtil.getCache(token);

    if (result) {
      return true;
    }
    const manager = await this.dbClient.getEntityManager(namespace);


    // Fallback to the database check
    const tokenEntry = await manager.createQueryBuilder(BlackListedTokens, 'bts')
    .where("bts.token = :token", {token: token}).getOne();

    
if(tokenEntry){
  return true;
}
   return false;

  } catch (error) {
    this.logger.log("unable to check whether token is blacklisted or not ---------------->")

      throw new Error(error);
  }
  }

  async syncBlacklistWithRedis(namespace: string) {
    this.logger.log("syncing blacklisted tokens fron db to redis -------------------->")
    try {
    const manager = await this.dbClient.getEntityManager(namespace);
    const blacklistedTokens = await manager.createQueryBuilder(BlackListedTokens, 'bts').getMany()

    for (const token of blacklistedTokens) {
      const ttl = Math.floor((new Date(token.expiresAt).getTime() - Date.now()) / 1000);
      if (ttl > 0) {
        await this.cachingUtil.setCache(token.token, JSON.stringify(token),ttl);
      }
    }
  } catch (error) {
    this.logger.log("unable to sync blacklisted tokens fron db to redis ----------------->")
      throw new Error(error)
  }
  }
}
