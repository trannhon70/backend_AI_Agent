import { Test, TestingModule } from '@nestjs/testing';
import { LiveMessagesController } from './live_messages.controller';
import { LiveMessagesService } from './live_messages.service';

describe('LiveMessagesController', () => {
  let controller: LiveMessagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiveMessagesController],
      providers: [LiveMessagesService],
    }).compile();

    controller = module.get<LiveMessagesController>(LiveMessagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
