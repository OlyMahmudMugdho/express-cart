import { Controller, Post, Body, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';

@Controller('webhook')
export class WebhookController {
  constructor(private stripeService: StripeService) {}

  @Post()
  async handleWebhook(
    @Body() body: any,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      const event = body;
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          console.log('Payment succeeded:', event.data.object.id);
          break;
        case 'payment_intent.payment_failed':
          console.log('Payment failed:', event.data.object.id);
          break;
        case 'charge.refunded':
          console.log('Refund processed:', event.data.object.id);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Webhook error:', error);
      return { error: 'Webhook handler failed' };
    }
  }
}
