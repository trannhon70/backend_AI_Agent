import { Test, TestingModule } from '@nestjs/testing';
import { PageTokensController } from './page_tokens.controller';
import { PageTokensService } from './page_tokens.service';

describe('PageTokensController', () => {
  let controller: PageTokensController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PageTokensController],
      providers: [PageTokensService],
    }).compile();

    controller = module.get<PageTokensController>(PageTokensController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
