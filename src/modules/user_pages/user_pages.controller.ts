import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserPagesService } from './user_pages.service';
import { CreateUserPageDto } from './dto/create-user_page.dto';
import { UpdateUserPageDto } from './dto/update-user_page.dto';

@Controller('user-pages')
export class UserPagesController {
  constructor(private readonly userPagesService: UserPagesService) {}

  @Post()
  create(@Body() createUserPageDto: CreateUserPageDto) {
    return this.userPagesService.create(createUserPageDto);
  }

  @Get()
  findAll() {
    return this.userPagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userPagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserPageDto: UpdateUserPageDto) {
    return this.userPagesService.update(+id, updateUserPageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userPagesService.remove(+id);
  }
}
