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
    const { pageIndex = 1, limit = 10, search, page_id, is_deleted } = query;
    const fanpage = await this.fanpageRepo.findOne({ where: { page_id }, select: { id: true }, });

    if (!fanpage) {
      throw new NotFoundException('Không tìm thấy fanpage!');
    }

    const qb = this.labelRepo
      .createQueryBuilder('label')
      .select(['label.id', 'label.name', 'label.color', 'label.created_at', 'label.is_deleted',])
      .where('label.fanpage_id = :fanpage_id', { fanpage_id: fanpage.id })
      .andWhere('label.is_deleted = :is_deleted', { is_deleted });

    if (search?.trim()) {
      qb.andWhere(
        `label.search_vector @@ websearch_to_tsquery('simple', unaccent(:search))`,
        {
          search: search.trim(),
        },
      );
    }

    qb.orderBy('label.created_at', 'DESC').addOrderBy('label.id', 'DESC').skip((pageIndex - 1) * limit).take(limit + 1);
    const rows = await qb.getMany();
    const hasMore = rows.length > limit;

    return {
      pageIndex,
      limit,
      hasMore,
      data: hasMore ? rows.slice(0, limit) : rows,
    };
  }

  async random() {
    const TOTAL = 10_000_000;
    const BATCH_SIZE = 50_000; // đừng để 500000

    const LABEL_PREFIXES = [
      'Khách VIP', 'Chờ xử lý', 'Đã thanh toán', 'Đã hủy',
      'Cần tư vấn', 'Khiếu nại', 'Đơn mới', 'Đang giao',
      'Đã giao', 'Hoàn hàng', 'Tiềm năng', 'Đã chốt'
    ];

    const COLORS = [
      '#F87171',
      '#FB923C',
      '#FBBF24',
      '#34D399',
      '#60A5FA',
      '#818CF8',
    ];

    const fanpages = await this.fanpageRepo.find({
      select: {
        id: true,
      },
    });

    if (!fanpages.length) {
      throw new BadRequestException('Không có fanpage');
    }

    const randomCreatedAt = () => {
      const now = Date.now();
      const twoYearsAgo = now - 2 * 365 * 24 * 3600 * 1000;

      return Math.floor(
        (twoYearsAgo + Math.random() * (now - twoYearsAgo)) / 1000,
      );
    };

    console.log('Start seed labels...');

    for (let i = 0; i < TOTAL; i += BATCH_SIZE) {

      const values: string[] = [];

      for (let j = 0; j < BATCH_SIZE && i + j < TOTAL; j++) {

        const name =
          LABEL_PREFIXES[Math.floor(Math.random() * LABEL_PREFIXES.length)] +
          ' #' +
          (i + j);

        const color =
          COLORS[Math.floor(Math.random() * COLORS.length)];

        const fanpageId =
          fanpages[Math.floor(Math.random() * fanpages.length)].id;

        const isDeleted = Math.random() < 0.05;

        values.push(`(
                '${name.replace(/'/g, "''")}',
                '${color}',
                ${fanpageId},
                ${isDeleted},
                ${randomCreatedAt()}
            )`);
      }

      await this.labelRepo.query(`
            INSERT INTO labels
            (
                name,
                color,
                fanpage_id,
                is_deleted,
                created_at
            )
            VALUES
            ${values.join(',')}
            ON CONFLICT (fanpage_id, name)
            DO NOTHING
        `);

      console.log(
        `Inserted ${Math.min(i + BATCH_SIZE, TOTAL).toLocaleString()} / ${TOTAL.toLocaleString()}`
      );
    }

    return {
      success: true,
    };
  }

}
