import { Test, TestingModule } from '@nestjs/testing';
import { FacebookWebhookController } from './facebook-webhook.controller';
import { FacebookWebhookService } from './facebook-webhook.service';

describe('FacebookWebhookController', () => {
  let controller: FacebookWebhookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacebookWebhookController],
      providers: [FacebookWebhookService],
    }).compile();

    controller = module.get<FacebookWebhookController>(FacebookWebhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
