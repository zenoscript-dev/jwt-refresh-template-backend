import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlackListedTokens } from '../models/blackListTokens.model';
import { CachingUtil } from 'src/core/utils/caching.util';

@Injectable()
export class BlackListTokenService {
  constructor(
    private cachingUtil: CachingUtil,
    @InjectRepository(BlackListedTokens)
    private blackListedTokensRepository: Repository<BlackListedTokens>,
    private logger: Logger,
  ) {}

  async blacklistToken(token: string, expiresIn: number) {
    this.logger.log('calling token blacklisting method ---------------->');

    try {
      await this.cachingUtil.setCache(
        token,
        JSON.stringify({ token }),
        expiresIn,
      );

      // Also save to the database
      const blackListedToken = new BlackListedTokens();
      blackListedToken.token = token;
      blackListedToken.expiresAt = new Date(Date.now() + expiresIn * 1000);
      const newBlacklistedToken =
        this.blackListedTokensRepository.create(blackListedToken);
      await this.blackListedTokensRepository.save(newBlacklistedToken);
    } catch (error) {
      this.logger.log('unable to blacklist token ---------------->');
      throw new Error(error);
    }
  }

  async isTokenBlacklisted(token: string, namespace: string): Promise<boolean> {
    try {
      this.logger.log(
        'checking whether token is blacklisted or not ---------------->',
      );
      const result = await this.cachingUtil.getCache(token);

      if (result) {
        return true;
      }

      // Fallback to the database check
      const tokenEntry = await this.blackListedTokensRepository
        .createQueryBuilder('bts')
        .where('bts.token = :token', { token: token })
        .getOne();

      if (tokenEntry) {
        return true;
      }
      return false;
    } catch (error) {
      this.logger.log(
        'unable to check whether token is blacklisted or not ---------------->',
      );

      throw new Error(error);
    }
  }

  async syncBlacklistWithRedis(namespace: string) {
    this.logger.log(
      'syncing blacklisted tokens fron db to redis -------------------->',
    );
    try {
      const blacklistedTokens = await this.blackListedTokensRepository.find();

      for (const token of blacklistedTokens) {
        const ttl = Math.floor(
          (new Date(token.expiresAt).getTime() - Date.now()) / 1000,
        );
        if (ttl > 0) {
          await this.cachingUtil.setCache(
            token.token,
            JSON.stringify(token),
            ttl,
          );
        }
      }
    } catch (error) {
      this.logger.log(
        'unable to sync blacklisted tokens fron db to redis ----------------->',
      );
      throw new Error(error);
    }
  }
}
