import { Injectable } from '@nestjs/common';
import { CreateFanpageDto } from './dto/create-fanpage.dto';
import { UpdateFanpageDto } from './dto/update-fanpage.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { Repository } from 'typeorm';
import { Fanpage } from './entities/fanpage.entity';
const usedPageIds = new Set<string>();

function randomPageId(): string {
  while (true) {
    const id =
      "page_" +
      Math.random().toString(36).slice(2, 10) +
      Date.now().toString(36);

    if (!usedPageIds.has(id)) {
      usedPageIds.add(id);
      return id;
    }
  }
}
@Injectable()
export class FanpagesService {
  constructor(
    @InjectRepository(Fanpage)
    private fanpageRepo: Repository<Fanpage>,

    private readonly jwtService: JwtService, // Inject JwtService
    private readonly redisService: RedisService,
  ) { }
  async getPageId(user_id: number, param: any) {
    try {
      // const cacheKey = `page_id:${param.id}`;

      // const cache = await this.redisService.get(cacheKey);
      // if (cache) {
      //   return cache;
      // }
      const result = await this.fanpageRepo.findOne({ where: { page_id: param.id } })
      //Lưu redis 8 tiếng
      // await this.redisService.set(cacheKey, result, 28800);
      return result
    } catch (error) {
      throw error
    }
  }

  async createTest() {
    try {
      const TOTAL = 100;
      const BATCH_SIZE = 100;

      const now = Math.floor(Date.now() / 1000);

      const firstNames = [
        'Nguyễn Văn', 'Trần Thị', 'Lê Văn', 'Phạm Thị', 'Hoàng Văn',
        'Huỳnh Thị', 'Phan Văn', 'Vũ Thị', 'Đặng Văn', 'Bùi Thị',
        'Đỗ Văn', 'Hồ Thị', 'Ngô Văn', 'Dương Thị', 'Lý Văn',
      ];

      const lastNames = [
        'An', 'Bình', 'Cường', 'Dũng', 'Duy', 'Đạt', 'Giang', 'Hà',
        'Hải', 'Hạnh', 'Hiếu', 'Hoa', 'Hùng', 'Huy', 'Khang', 'Khoa',
        'Lâm', 'Linh', 'Loan', 'Long', 'Mai', 'Minh', 'My', 'Nam',
        'Nga', 'Ngọc', 'Nhi', 'Phong', 'Phúc', 'Quân', 'Quang', 'Sơn',
        'Thảo', 'Thắng', 'Thư', 'Thủy', 'Trang', 'Trung', 'Tuấn', 'Vy',
      ];

      const randomName = () => {
        const first = firstNames[Math.floor(Math.random() * firstNames.length)];
        const last = lastNames[Math.floor(Math.random() * lastNames.length)];
        return `${first} ${last}`;
      };

      console.log('🚀 Start creating fanpages...');

      for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
        const values: string[] = [];

        for (let j = 0; j < BATCH_SIZE && i + j < TOTAL; j++) {
          const index = i + j + 1;
          const pageId = randomPageId();
          const pageName = randomName().replace(/'/g, "''");

          values.push(`(
            10,
          '${pageId}',
          '${pageName}',
          '',
          '',
          ${now}
        )`);
        }

        await this.fanpageRepo.query(`
        INSERT INTO fanpages (
        user_id,
          page_id,
          page_name,
          page_avatar,
          access_token,
          created_at
        )
        VALUES
        ${values.join(',')}
        ON CONFLICT (page_id) DO NOTHING;
      `);

        console.log(`Inserted ${Math.min(i + BATCH_SIZE, TOTAL)}/${TOTAL}`);
      }

      console.log('✅ Done');

      return {
        success: true,
        message: 'Create fanpages successfully',
      };
    } catch (error) {
      throw error;
    }
  }


}
