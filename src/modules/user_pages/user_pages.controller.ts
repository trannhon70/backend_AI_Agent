import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { UserPagesService } from './user_pages.service';
import { CreateUserPageDto } from './dto/create-user_page.dto';
import { UpdateUserPageDto } from './dto/update-user_page.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('user-pages')
export class UserPagesController {
  constructor(
    private readonly userPagesService: UserPagesService
  ) { }

  @Get('get-paging')
  @UseGuards(JwtAuthGuard)
  async getpaging(@Req() req: any, @Query() query: any) {
    const data = await this.userPagesService.getPaging(req.user.id, query);
    return {
      statusCode: 1,
      message: 'get paging user pages success!',
      data: data
    };
  }

  @Get('get-count-provider')
  @UseGuards(JwtAuthGuard)
  async getCountProvider(@Req() req: any) {
    const data = await this.userPagesService.getCountProvider(req.user.id);
    return {
      statusCode: 1,
      message: 'get paging user pages success!',
      data: data
    };
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  async delete(@Req() req: any, @Param() param: any) {
    const data = await this.userPagesService.delete(param);
    return {
      statusCode: 1,
      message: 'delete user pages success!',
      data: data
    };
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createUserPage(@Req() req: any, @Body() body: any) {
    const data = await this.userPagesService.createUserPage(body);
    return {
      statusCode: 1,
      message: 'create user pages success!',
      data: data
    };
  }

  @Get('get-paging-user-page-active')
  @UseGuards(JwtAuthGuard)
  async getPagingUserPageActive(@Req() req: any, @Query() query: any) {
    const data = await this.userPagesService.getPagingUserPageActive(req.user.id, query);
    return {
      statusCode: 1,
      message: 'get paging user pages success!',
      data: data
    };
  }
}
