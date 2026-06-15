import { Test, TestingModule } from '@nestjs/testing';
import { FanpagesService } from './fanpages.service';

describe('FanpagesService', () => {
  let service: FanpagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FanpagesService],
    }).compile();

    service = module.get<FanpagesService>(FanpagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
