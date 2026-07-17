import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
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

    try {
      const result = await this.kafkaService.send(DomainEvents.label_create, body);
      return {
        statusCode: 200,
        message: 'Thêm mới thẻ hội thoại thành công ',
        data: result
      }
    } catch (e) {
      throw new BadRequestException(e);
    }

  }


}
