import { Injectable } from '@nestjs/common';
import { CreateUserPageDto } from './dto/create-user_page.dto';
import { UpdateUserPageDto } from './dto/update-user_page.dto';

@Injectable()
export class UserPagesService {
  create(createUserPageDto: CreateUserPageDto) {
    return 'This action adds a new userPage';
  }

  findAll() {
    return `This action returns all userPages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userPage`;
  }

  update(id: number, updateUserPageDto: UpdateUserPageDto) {
    return `This action updates a #${id} userPage`;
  }

  remove(id: number) {
    return `This action removes a #${id} userPage`;
  }
}
