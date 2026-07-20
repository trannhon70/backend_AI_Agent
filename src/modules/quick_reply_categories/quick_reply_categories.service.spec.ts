import { Test, TestingModule } from '@nestjs/testing';
import { QuickReplyCategoriesService } from './quick_reply_categories.service';

describe('QuickReplyCategoriesService', () => {
  let service: QuickReplyCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuickReplyCategoriesService],
    }).compile();

    service = module.get<QuickReplyCategoriesService>(QuickReplyCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
