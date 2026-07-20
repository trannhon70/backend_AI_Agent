import { Controller, createParamDecorator, ExecutionContext, Post, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { QuickReplyCategoriesService } from './quick_reply_categories.service';
import { CreateQuickReplyCategoryDto } from './dto/create-quick_reply_category.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { KafkaService } from '../kafka/kafka.service';
import { DomainEvents } from '../kafka/kafka.events';
import { JwtGrpcAuthGuard } from 'src/common/guards/JwtGrpcAuthGuard';
import { Metadata } from '@grpc/grpc-js';
import { getCurrentUser } from 'src/shared/utils';


@UseGuards(JwtGrpcAuthGuard)
@Controller('quick-reply-categories')
export class QuickReplyCategoriesController {
  constructor(
    private readonly quickReplyCategoriesService: QuickReplyCategoriesService,
    private readonly kafkaService: KafkaService,
  ) { }

  @GrpcMethod('QuickReplyCategoryService', 'Create')
  async create(body: CreateQuickReplyCategoryDto, metadata: Metadata,) {
    const user = getCurrentUser(metadata);
    return await this.quickReplyCategoriesService.create(body, user.id);

  }


}