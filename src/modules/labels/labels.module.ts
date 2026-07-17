import { Module } from '@nestjs/common';
import { LabelsService } from './labels.service';
import { LabelsController } from './labels.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fanpage } from '../fanpages/entities/fanpage.entity';
import { Label } from './entities/label.entity';
import { LabelsRepository } from './labels.repository';
import { LabelConsumer } from './labels.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fanpage, Label]),
  ],
  controllers: [LabelsController, LabelConsumer],
  providers: [LabelsService, LabelsRepository],
})
export class LabelsModule { }
