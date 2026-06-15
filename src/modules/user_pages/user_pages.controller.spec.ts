import { Test, TestingModule } from '@nestjs/testing';
import { UserPagesController } from './user_pages.controller';
import { UserPagesService } from './user_pages.service';

describe('UserPagesController', () => {
  let controller: UserPagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserPagesController],
      providers: [UserPagesService],
    }).compile();

    controller = module.get<UserPagesController>(UserPagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
