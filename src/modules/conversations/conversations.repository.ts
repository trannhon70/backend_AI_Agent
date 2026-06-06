import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/config/base.repository';
import { DataSource } from 'typeorm';

@Injectable()
export class ConversationsRepository extends BaseRepository<any> {
    constructor(dataSource: DataSource) {
        super(dataSource, 'conversations', ["id"]);
    }
}