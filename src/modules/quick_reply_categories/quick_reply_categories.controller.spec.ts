import { Test, TestingModule } from '@nestjs/testing';
import { QuickReplyCategoriesController } from './quick_reply_categories.controller';
import { QuickReplyCategoriesService } from './quick_reply_categories.service';

describe('QuickReplyCategoriesController', () => {
  let controller: QuickReplyCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuickReplyCategoriesController],
      providers: [QuickReplyCategoriesService],
    }).compile();

    controller = module.get<QuickReplyCategoriesController>(QuickReplyCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
