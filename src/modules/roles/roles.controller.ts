import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CheckRoles } from 'src/shared/utils';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Post()
  @Roles(CheckRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() body: any) {
    const data = await this.rolesService.create(body);
    return {
      statusCode: 1,
      message: 'create role success!',
      data: data
    }
  }
  //cấu trúc này dành cho dữ liệu cực lớn lên hàng triệu row
  // @Get('get-all')
  // async findAll(@Res() res: any) {
  //   const stream = await this.rolesService.findAll();
  //   res.setHeader('Content-Type', 'application/json');
  //   res.write('{"statusCode":1,"message":"get all role success!","data":[');
  //   let first = true;
  //   for await (const row of stream) {
  //     if (!first) res.write(',');
  //     res.write(JSON.stringify(row));
  //     first = false;
  //   }

  //   res.write(']');
  //   res.end();
  // }

  @Get('get-all')
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const data = await this.rolesService.findAll();
    return {
      statusCode: 1,
      message: 'get all role success!',
      data: data
    }
  }

  @Get('get-paging')
  @UseGuards(JwtAuthGuard)
  async getPaging(@Query() query: any) {
    const data = await this.rolesService.getPaging(query);
    return {
      statusCode: 1,
      message: 'get paging role success!',
      data: data
    }
  }


}
