import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeController } from './stripe.controller';
import { WebhookController } from './webhook.controller';
import { StripeService } from './stripe.service';

@Module({
  imports: [ConfigModule],
  controllers: [StripeController, WebhookController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
