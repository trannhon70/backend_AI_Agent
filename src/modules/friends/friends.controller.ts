import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { DomainEvents } from '../kafka/kafka.events';
import { KafkaService } from '../kafka/kafka.service';
import { FriendsService } from './friends.service';

@Controller('friends')
export class FriendsController {
  constructor(
    private readonly friendsService: FriendsService,
    private readonly kafkaService: KafkaService,
  ) { }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() body: any) {

    const result = await this.kafkaService.send(DomainEvents.Friend_create, body);
    console.log(result, 'result');

    return {
      code: 1,
      message: 'create friend successfully!',
      data: result
    };
  }

  @Get('get-all-by-id/:id')
  @UseGuards(JwtAuthGuard)
  async getAllById(@Req() req: any, @Param() param: any) {
    const data = await this.friendsService.getAllById(req, param);
    return {
      code: 1,
      message: 'getAllById friend success!',
      data: data,
    };
  }
}
