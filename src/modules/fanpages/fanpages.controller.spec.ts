import { Test, TestingModule } from '@nestjs/testing';
import { FanpagesController } from './fanpages.controller';
import { FanpagesService } from './fanpages.service';

describe('FanpagesController', () => {
  let controller: FanpagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FanpagesController],
      providers: [FanpagesService],
    }).compile();

    controller = module.get<FanpagesController>(FanpagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
