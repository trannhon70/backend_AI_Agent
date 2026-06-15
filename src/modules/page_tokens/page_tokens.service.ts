import { Injectable } from '@nestjs/common';
import { CreatePageTokenDto } from './dto/create-page_token.dto';
import { UpdatePageTokenDto } from './dto/update-page_token.dto';

@Injectable()
export class PageTokensService {
  create(createPageTokenDto: CreatePageTokenDto) {
    return 'This action adds a new pageToken';
  }

  findAll() {
    return `This action returns all pageTokens`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pageToken`;
  }

  update(id: number, updatePageTokenDto: UpdatePageTokenDto) {
    return `This action updates a #${id} pageToken`;
  }

  remove(id: number) {
    return `This action removes a #${id} pageToken`;
  }
}
