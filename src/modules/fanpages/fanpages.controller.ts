import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FanpagesService } from './fanpages.service';
import { CreateFanpageDto } from './dto/create-fanpage.dto';
import { UpdateFanpageDto } from './dto/update-fanpage.dto';
import { KafkaService } from '../kafka/kafka.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { DomainEvents } from '../kafka/kafka.events';

@Controller('fanpages')
export class FanpagesController {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly fanpagesService: FanpagesService
  ) { }

  @Post('connect-page-facebook')
  @UseGuards(JwtAuthGuard)
  async createConnectPageFacebook(@Req() req: any, @Body() body: any) {
    const payload = {
      ...body,
      user_id: req.user.id
    }

    const result = await this.kafkaService.send(DomainEvents.FanPage_connect_facebook, payload);
    return {
      statusCode: 1,
      message: 'Kết nối facebook thành công!',
      data: result
    };
  }

  @Post('token-renewal')
  @UseGuards(JwtAuthGuard)
  async tokenRenewal(@Req() req: any, @Body() body: any) {
    const payload = {
      ...body,
      user_id: req.user.id
    }

    const result = await this.kafkaService.send(DomainEvents.FanPage_tokenRenewal, payload);
    return {
      statusCode: 1,
      message: 'tạo mới token thành công!',
      data: result
    };
  }

  @Get('get-page-id/:id')
  @UseGuards(JwtAuthGuard)
  async getPageId(@Req() req: any, @Param() param: any) {

    const result = await this.fanpagesService.getPageId(req.user.id, param)

    return {
      statusCode: 1,
      message: 'get page_id success!',
      data: result
    };
  }


}
