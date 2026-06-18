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
      return await this.fanpageRepo.findOne({ where: { page_id: param.id } })
    } catch (error) {
      throw error
    }
  }


}
