import { PartialType } from '@nestjs/mapped-types';
import { CreateFacebookWebhookDto } from './create-facebook-webhook.dto';

export class UpdateFacebookWebhookDto extends PartialType(CreateFacebookWebhookDto) {}
