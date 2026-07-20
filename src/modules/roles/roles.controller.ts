import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleEnum } from 'src/shared/enums/role.enum';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Post()
  @Roles(RoleEnum.OWNER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() body: any) {
    const data = await this.rolesService.create(body);
    return {
      code: 1,
      message: 'create role success!',
      data: data
    }
  }
  //cấu trúc này dành cho dữ liệu cực lớn lên hàng triệu row
  // @Get('get-all')
  // async findAll(@Res() res: any) {
  //   const stream = await this.rolesService.findAll();
  //   res.setHeader('Content-Type', 'application/json');
  //   res.write('{"code":1,"message":"get all role success!","data":[');
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
      code: 1,
      message: 'get all role success!',
      data: data
    }
  }

  @Get('get-paging')
  @UseGuards(JwtAuthGuard)
  async getPaging(@Query() query: any) {
    const data = await this.rolesService.getPaging(query);
    return {
      code: 1,
      message: 'get paging role success!',
      data: data
    }
  }


}
