import { Injectable, ConflictException, NotFoundException, InternalServerErrorException, Logger, BadRequestException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Fanpage } from '../fanpages/entities/fanpage.entity';
import { QuickReplyCategory } from './entities/quick_reply_category.entity';
import { CreateQuickReplyCategoryDto } from './dto/create-quick_reply_category.dto';
import { currentTimestamp } from 'src/shared/utils/currentTimestamp';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class QuickReplyCategoriesService {
  private readonly logger = new Logger(QuickReplyCategoriesService.name,);
  constructor(
    @InjectRepository(QuickReplyCategory)
    private readonly quickReplyCategoryRepo: Repository<QuickReplyCategory>,

    @InjectRepository(Fanpage)
    private readonly fanpageRepo: Repository<Fanpage>,
  ) { }

  async create(dto: CreateQuickReplyCategoryDto) {
    if (!dto.page_id) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'page_id không được để trống!', });
    }
    const fanpage = await this.fanpageRepo.findOne({ where: { page_id: dto.page_id }, select: { id: true } });
    if (!fanpage) {
      throw new RpcException({ code: status.NOT_FOUND, message: 'Không tìm thấy fanpage', });
    }
    const category = this.quickReplyCategoryRepo.create({ name: dto.name, color: dto.color, fanpage_id: fanpage.id, created_at: currentTimestamp() });
    try {
      const saved = await this.quickReplyCategoryRepo.save(category);
      return saved
    } catch (error) {
      if (error instanceof QueryFailedError && error.driverError?.code === '23505') {

        throw new RpcException({ code: status.ALREADY_EXISTS, message: 'Tên danh mục đã tồn tại!', });
      }
      this.logger.error(error);
      throw new RpcException({ code: status.INTERNAL, message: 'Không thể tạo danh mục', });
    }
  }
}