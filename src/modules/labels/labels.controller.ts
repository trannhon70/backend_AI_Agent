import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpException, HttpStatus, BadRequestException, Put, ParseIntPipe, Query } from '@nestjs/common';
import { LabelsService } from './labels.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { KafkaService } from '../kafka/kafka.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { DomainEvents } from '../kafka/kafka.events';
import { GetPagingLabelDto } from './dto/getpaging-label.dto';

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

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async delete(@Param() param: any) {

    try {
      const result = await this.labelsService.delete(param)
      return {
        statusCode: 200,
        message: 'Xóa thẻ hội thoại thành công ',
        data: result
      }
    } catch (e) {
      throw new BadRequestException(e);
    }

  }

  @Put("")
  @UseGuards(JwtAuthGuard)
  async update(@Body() body: UpdateLabelDto) {
    try {
      const result = await this.kafkaService.send(DomainEvents.label_update, body);
      return {
        statusCode: 200,
        message: 'Cập nhật thẻ hội thoại thành công ',
        data: result
      }
    } catch (e) {
      throw new BadRequestException(e);
    }

  }

  @Get('get-paging')
  @UseGuards(JwtAuthGuard)
  async getPaging(@Query() query: GetPagingLabelDto) {
    const result = await this.labelsService.getPaging(query)
    return {
      statusCode: 1,
      message: 'get getPaging success!',
      data: result
    };
  }

  @Post('random')
  async Random() {
    const result = await this.labelsService.random()
    return {
      statusCode: 1,
      message: 'create random success!',
      data: result
    };
  }

}
