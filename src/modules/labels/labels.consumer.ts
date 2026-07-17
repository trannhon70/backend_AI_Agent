import { BadRequestException, Controller, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventPattern, Payload, MessagePattern, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { DomainEvents } from '../kafka/kafka.events';
import { Label } from './entities/label.entity';
import { LabelsRepository } from './labels.repository';
import { CreateLabelDto } from './dto/create-label.dto';
import { currentTimestamp } from 'src/shared/utils/currentTimestamp';
import { Fanpage } from '../fanpages/entities/fanpage.entity';


@Controller()
export class LabelConsumer {
    private readonly logger = new Logger(LabelConsumer.name);
    constructor(
        @InjectRepository(Label)
        private readonly LabelRepo: Repository<Label>,

        private readonly labelsRepository: LabelsRepository,

        @InjectRepository(Fanpage)
        private readonly fanpageRepo: Repository<Fanpage>,


        private readonly eventEmitter: EventEmitter2,
    ) { }


    @MessagePattern(DomainEvents.label_create)
    async createLabel(@Payload() dto: CreateLabelDto) {
        const fanpage = await this.fanpageRepo.findOneBy({
            page_id: dto.page_id,
        });

        if (!fanpage) {
            throw new RpcException({
                statusCode: 404,
                message: 'Không tìm thấy trang fanpage!',
            });
        }

        try {
            return await this.labelsRepository.create({
                name: dto.name,
                color: dto.color,
                fanpage_id: fanpage.id,
                created_at: currentTimestamp(),
            });
        } catch (error) {
            this.logger.error(error);

            if (
                error instanceof QueryFailedError &&
                error.driverError?.code === '23505'
            ) {
                throw new RpcException({
                    statusCode: 409,
                    message: 'Thẻ hội thoại này đã tồn tại!',
                });
            }

            throw new RpcException({
                statusCode: 500,
                message: 'Internal server error',
            });
        }
    }


}