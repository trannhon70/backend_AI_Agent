import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Label } from './entities/label.entity';
import { Repository } from 'typeorm';
import { LabelsRepository } from './labels.repository';
import { GetPagingLabelDto } from './dto/getpaging-label.dto';
import { FanPagesRepository } from '../fanpages/fanpages.repository';
import { Fanpage } from '../fanpages/entities/fanpage.entity';

@Injectable()
export class LabelsService {
  constructor(
    @InjectRepository(Label)
    private labelRepo: Repository<Label>,

    private readonly labelsRepository: LabelsRepository,

    @InjectRepository(Fanpage)
    private fanpageRepo: Repository<Fanpage>,

  ) { }

  async delete(param: any) {
    try {
      return await this.labelsRepository.update(param.id, { is_deleted: true })
    } catch (error) {
      throw error
    }
  }

  async getPaging(query: GetPagingLabelDto) {
    const { pageIndex = 1, limit = 10, search = '', page_id } = query;
    const skip = (pageIndex - 1) * limit;

    const fanpage = await this.fanpageRepo.findOne({
      where: { page_id },
      select: { id: true },
    });

    if (!fanpage) {
      throw new NotFoundException('Không tìm thấy fanpage!');
    }

    const qb = this.labelRepo.createQueryBuilder('label')
      .where('label.fanpage_id = :fanpage_id', { fanpage_id: fanpage.id })
      .andWhere('label.is_deleted = :is_deleted', { is_deleted: false })
      .orderBy('label.created_at', 'DESC')
      .addOrderBy('label.id', 'DESC')
      .skip(skip)
      .take(limit + 1);

    if (search) {
      qb.andWhere(
        `label.search_vector @@ websearch_to_tsquery('simple', unaccent(:search))`,
        { search },
      );
    }

    const rows = await qb.getMany();

    return {
      pageIndex,
      limit,
      hasMore: rows.length > limit,
      data: rows.slice(0, limit).reverse(),
    };
  }

}
