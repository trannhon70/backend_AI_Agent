import { Controller, createParamDecorator, ExecutionContext, Post, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { QuickReplyCategoriesService } from './quick_reply_categories.service';
import { CreateQuickReplyCategoryDto } from './dto/create-quick_reply_category.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { KafkaService } from '../kafka/kafka.service';
import { DomainEvents } from '../kafka/kafka.events';

export const CurrentUser = createParamDecorator(
  (_, ctx: ExecutionContext) => {

    const rpc =
      ctx.switchToRpc();

    return rpc.getContext().user;
  },
);

@Controller('quick-reply-categories')
export class QuickReplyCategoriesController {
  constructor(
    private readonly quickReplyCategoriesService: QuickReplyCategoriesService,
    private readonly kafkaService: KafkaService,
  ) { }

  @GrpcMethod('QuickReplyCategoryService', 'Create')
  async create(body: CreateQuickReplyCategoryDto, @CurrentUser() user: any) {
    console.log(user, 'user');

    return await this.quickReplyCategoriesService.create(body);

  }

  @Post('')
  @UseGuards(JwtAuthGuard)
  async insert(dto: CreateQuickReplyCategoryDto,) {
    const result = await this.kafkaService.send(DomainEvents.quick_reply_categories_insert, dto);
    return {
      code: 1,
      message: 'create success!',
      data: result
    };
  }
}