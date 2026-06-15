import { Injectable } from '@nestjs/common';
import { CreateFanpageDto } from './dto/create-fanpage.dto';
import { UpdateFanpageDto } from './dto/update-fanpage.dto';

@Injectable()
export class FanpagesService {
  create(createFanpageDto: CreateFanpageDto) {
    return 'This action adds a new fanpage';
  }

  findAll() {
    return `This action returns all fanpages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fanpage`;
  }

  update(id: number, updateFanpageDto: UpdateFanpageDto) {
    return `This action updates a #${id} fanpage`;
  }

  remove(id: number) {
    return `This action removes a #${id} fanpage`;
  }
}
