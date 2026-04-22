import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeController } from './stripe.controller';
import { WebhookController } from './webhook.controller';
import { StripeService } from './stripe.service';
import { Order } from '../checkout/entities/order.entity';
import { Payment } from '../checkout/entities/payment.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Order, Payment])],
  controllers: [StripeController, WebhookController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
