import { BadRequestException, Body, Controller, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { ClientInfo } from 'src/common/checkIp';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUploadInterceptor } from 'utils/file-upload.util';
import { KafkaService } from '../kafka/kafka.service';
import { SocketService } from '../socket/socket.service';
import { DomainEvents } from '../kafka/kafka.events';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CheckRoles } from 'utils';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly usersService: UsersService,
    private readonly socketService: SocketService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  @Post('create')
  @Roles(CheckRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() body: any) {
    const check = await this.userRepo.findOne({ where: { email: body.email } });
    if (check) {
      throw new BadRequestException('Email đã được đăng ký, vui lòng đăng ký mail khác!');
    }
    this.kafkaService.publish(DomainEvents.UserCreated, body);
    return {
      statusCode: 1,
      message: 'create user success!',
    };
  }

  @Post('login')
  async login(@Body() body: any, @ClientInfo() ip: string) {
    const data = await this.usersService.login(body, ip);
    return {
      statusCode: 1,
      message: 'Đăng nhập thành công!',
      token: data.token,
      user: data.user,
      startTime: data.startTime,
      endTime: data.endTime
    };
  }

  @Get('get-by-id-user')
  @UseGuards(JwtAuthGuard)
  async GetByIdUser(@Req() req: any) {
    const data = await this.usersService.GetByIdUser(req.user.id);
    return {
      statusCode: 1,
      message: 'get by id user success!',
      data: data
    };
  }

  @Post('update-profile')
  @UseInterceptors(FileInterceptor('file', fileUploadInterceptor('./uploads')))
  async updateProfile(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,

  ) {
    const payload = {
      ...body,
      userId: req.user.id,
      file: file?.filename
    }
    this.kafkaService.publish(DomainEvents.User_update_profile, payload);
    return {
      statusCode: 1,
      message: 'cập nhật thành công!',
    };
  }

  @Get('get-paging-admin')
  async getPagingAdmin(@Req() req: any, @Query() query: any) {
    const data = await this.usersService.getPagingAdmin(req, query);
    return {
      statusCode: 1,
      message: 'get paging user success!',
      data: data
    };
  }

  @Post('close-the-lock')
  async closeTheLock(@Body() body: any) {
    this.kafkaService.publish(DomainEvents.User_close_the_lock, body);
    return {
      statusCode: 1,
      message: 'account locked successfully!',
    };
  }

  @Put('update-password/:id')
  async updatePassword(@Body() body: any, @Param() param: any) {
    const data = {
      id: param.id,
      password: body.password
    }
    this.kafkaService.publish(DomainEvents.User_update_password, data);
    return {
      statusCode: 1,
      message: 'update password successfully!',
    };
  }

  @Get('get-by-id/:id')
  async getById(@Req() req: any, @Param() param: any) {
    const data = await this.usersService.getById(req, param);
    return {
      statusCode: 1,
      message: 'get by id successfully!',
      data: data
    };
  }

  @Put('update/:id')
  async update(@Body() body: any, @Param() param: any) {
    const payload = {
      id: param.id,
      ...body
    }
    const result = await this.kafkaService.send(DomainEvents.User_update_item, payload);
    return {
      statusCode: 1,
      message: 'update user successfully!',
      data: result
    };
  }



}
