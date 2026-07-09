import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/config/base.repository';
import { DataSource } from 'typeorm';

@Injectable()
export class LiveMessagesRepository extends BaseRepository<any> {
    constructor(dataSource: DataSource) {
        super(dataSource, 'live_messages', ["id"]);
    }
}