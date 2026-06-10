import { BadRequestException, Body, Controller, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { ClientInfo } from 'src/common/checkIp';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUploadInterceptor } from 'src/shared/utils/file-upload.util';
import { KafkaService } from '../kafka/kafka.service';
import { SocketService } from '../socket/socket.service';
import { DomainEvents } from '../kafka/kafka.events';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RoleEnum } from 'src/shared/enums/role.enum';

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
  @Roles(RoleEnum.OWNER, RoleEnum.ADMIN_MANAGE)
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

  @Post('login-google')
  async loginGoogle(@Body() body: any) {
    const data = await this.usersService.loginGoogle(body);
    // return {
    //   statusCode: 1,
    //   message: 'Đăng nhập thành công!',
    //   token: data.token,
    //   user: data.user,
    //   startTime: data.startTime,
    //   endTime: data.endTime
    // };
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

}
