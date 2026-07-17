import { BadRequestException, Controller, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventPattern, Payload, MessagePattern, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

        private readonly LabelRepoConfig: LabelsRepository,

        @InjectRepository(Fanpage)
        private readonly FanpageRepo: Repository<Fanpage>,


        private readonly eventEmitter: EventEmitter2,
    ) { }


    @MessagePattern(DomainEvents.label_create)
    async createLabel(@Payload() dto: CreateLabelDto): Promise<Label> {
        const fanpage = await this.FanpageRepo.findOne({
            where: { page_id: dto.page_id },
            select: { id: true },
        });

        if (!fanpage) {
            throw new RpcException('Fanpage not found');
        }

        const exists = await this.LabelRepo.exists({
            where: {
                fanpage_id: fanpage.id,
                name: dto.name,
            },
        });

        if (exists) {
            throw new RpcException(`Label "${dto.name}" already exists.`);
        }

        return this.LabelRepoConfig.create({
            name: dto.name,
            color: dto.color,
            fanpage_id: fanpage.id,
            created_at: currentTimestamp(),
        });
    }


}