import { Test, TestingModule } from '@nestjs/testing';
import { FacebookWebhookService } from './facebook-webhook.service';

describe('FacebookWebhookService', () => {
  let service: FacebookWebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacebookWebhookService],
    }).compile();

    service = module.get<FacebookWebhookService>(FacebookWebhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
