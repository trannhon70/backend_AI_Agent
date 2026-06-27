import { Injectable } from '@nestjs/common';
import { CreateFanpageDto } from './dto/create-fanpage.dto';
import { UpdateFanpageDto } from './dto/update-fanpage.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { Repository } from 'typeorm';
import { Fanpage } from './entities/fanpage.entity';

@Injectable()
export class FanpagesService {
  constructor(
    @InjectRepository(Fanpage)
    private fanpageRepo: Repository<Fanpage>,

    private readonly jwtService: JwtService, // Inject JwtService
    private readonly redisService: RedisService,
  ) { }
  async getPageId(user_id: number, param: any) {
    try {
      // const cacheKey = `page_id:${param.id}`;

      // const cache = await this.redisService.get(cacheKey);
      // if (cache) {
      //   return cache;
      // }
      const result = await this.fanpageRepo.findOne({ where: { page_id: param.id } })
      //Lưu redis 8 tiếng
      // await this.redisService.set(cacheKey, result, 28800);
      return result
    } catch (error) {
      throw error
    }
  }


}
