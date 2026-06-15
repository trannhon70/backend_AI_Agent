import { Test, TestingModule } from '@nestjs/testing';
import { PageTokensService } from './page_tokens.service';

describe('PageTokensService', () => {
  let service: PageTokensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PageTokensService],
    }).compile();

    service = module.get<PageTokensService>(PageTokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
