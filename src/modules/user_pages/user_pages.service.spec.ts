import { Test, TestingModule } from '@nestjs/testing';
import { UserPagesService } from './user_pages.service';

describe('UserPagesService', () => {
  let service: UserPagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserPagesService],
    }).compile();

    service = module.get<UserPagesService>(UserPagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
