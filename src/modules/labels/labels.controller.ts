import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LabelsService } from './labels.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { KafkaService } from '../kafka/kafka.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { DomainEvents } from '../kafka/kafka.events';

@Controller('labels')
export class LabelsController {
  constructor(
    private readonly labelsService: LabelsService,
    private readonly kafkaService: KafkaService,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreateLabelDto) {

    const result = await this.kafkaService.publish(DomainEvents.label_create, body)
    return {
      statusCode: 1,
      message: 'create label success!',
      data: result
    }
  }


}
