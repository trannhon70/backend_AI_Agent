import { Test, TestingModule } from '@nestjs/testing';
import { LiveMessagesService } from './live_messages.service';

describe('LiveMessagesService', () => {
  let service: LiveMessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LiveMessagesService],
    }).compile();

    service = module.get<LiveMessagesService>(LiveMessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
