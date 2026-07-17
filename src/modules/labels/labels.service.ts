import { Injectable } from '@nestjs/common';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Label } from './entities/label.entity';
import { Repository } from 'typeorm';
import { LabelsRepository } from './labels.repository';

@Injectable()
export class LabelsService {
  constructor(
    @InjectRepository(Label)
    private LabelRepo: Repository<Label>,

    private readonly labelsRepository: LabelsRepository,

  ) { }

  async delete(param: any) {
    try {
      return await this.labelsRepository.update(param.id, { is_deleted: true })
    } catch (error) {
      throw error
    }
  }


}
