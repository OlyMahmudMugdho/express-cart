import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StripeService } from './stripe.service';
import { Order, OrderStatus } from '../checkout/entities/order.entity';
import { Payment, PaymentStatus } from '../checkout/entities/payment.entity';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private stripeService: StripeService,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
  ) {}

  @Post()
  async handleWebhook(
    @Body() body: any,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      const event = body;
      this.logger.log(`Received webhook event: ${event.type}`);
      
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const orderNumber = session.client_reference_id;
          this.logger.log(`Checkout session completed for order: ${orderNumber}`);
          
          if (orderNumber) {
            const order = await this.orderRepo.findOne({ where: { orderNumber } });
            if (order) {
              order.status = OrderStatus.PROCESSING;
              await this.orderRepo.save(order);
              this.logger.log(`Order ${orderNumber} status updated to PROCESSING`);

              const payment = await this.paymentRepo.findOne({ where: { orderId: order.id } });
              if (payment) {
                payment.status = PaymentStatus.SUCCEEDED;
                payment.stripePaymentIntentId = session.payment_intent;
                await this.paymentRepo.save(payment);
                this.logger.log(`Payment for order ${orderNumber} updated to SUCCEEDED`);
              }
            }
          }
          break;
        }
        case 'payment_intent.succeeded':
          this.logger.log('Payment intent succeeded:', event.data.object.id);
          break;
        case 'payment_intent.payment_failed':
          this.logger.log('Payment intent failed:', event.data.object.id);
          break;
        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Webhook error:', error);
      return { error: 'Webhook handler failed' };
    }
  }
}
