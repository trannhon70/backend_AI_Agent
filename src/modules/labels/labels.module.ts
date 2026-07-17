import { Module } from '@nestjs/common';
import { LabelsService } from './labels.service';
import { LabelsController } from './labels.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fanpage } from '../fanpages/entities/fanpage.entity';
import { Label } from './entities/label.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fanpage, Label]),
  ],
  controllers: [LabelsController],
  providers: [LabelsService],
})
export class LabelsModule { }
