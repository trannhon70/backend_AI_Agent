import { Module } from '@nestjs/common';
import { FanpagesService } from './fanpages.service';
import { FanpagesController } from './fanpages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fanpage } from './entities/fanpage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fanpage]),
  ],
  controllers: [FanpagesController],
  providers: [FanpagesService],
})
export class FanpagesModule { }
