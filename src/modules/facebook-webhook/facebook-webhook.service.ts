import { Injectable } from '@nestjs/common';
import { CreateFacebookWebhookDto } from './dto/create-facebook-webhook.dto';
import { UpdateFacebookWebhookDto } from './dto/update-facebook-webhook.dto';

@Injectable()
export class FacebookWebhookService {
  create(createFacebookWebhookDto: CreateFacebookWebhookDto) {
    return 'This action adds a new facebookWebhook';
  }

  findAll() {
    return `This action returns all facebookWebhook`;
  }

  findOne(id: number) {
    return `This action returns a #${id} facebookWebhook`;
  }

  update(id: number, updateFacebookWebhookDto: UpdateFacebookWebhookDto) {
    return `This action updates a #${id} facebookWebhook`;
  }

  remove(id: number) {
    return `This action removes a #${id} facebookWebhook`;
  }
}
