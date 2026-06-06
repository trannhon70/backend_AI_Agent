import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/config/base.repository';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersRepository extends BaseRepository<any> {
    constructor(dataSource: DataSource) {
        super(dataSource, 'users', ["id"]);
    }
}