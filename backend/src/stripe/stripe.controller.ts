import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-payment-intent')
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(@Body() body: { amount: number; currency?: string }) {
    const { amount, currency } = body;
    return this.stripeService.createPaymentIntent(amount, currency);
  }

  @Get('payment-intent/:id')
  @UseGuards(JwtAuthGuard)
  async retrievePaymentIntent(@Param('id') id: string) {
    return this.stripeService.retrievePaymentIntent(id);
  }

  @Post('payment-intent/:id/confirm')
  @UseGuards(JwtAuthGuard)
  async confirmPaymentIntent(@Param('id') id: string) {
    return this.stripeService.confirmPaymentIntent(id);
  }

  @Post('refund')
  @UseGuards(JwtAuthGuard)
  async createRefund(@Body() body: { paymentIntentId: string; amount?: number }) {
    const { paymentIntentId, amount } = body;
    return this.stripeService.createRefund(paymentIntentId, amount);
  }

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(@Body() body: { amount: number; currency?: string; orderNumber?: string }) {
    const { amount, currency, orderNumber } = body;
    return this.stripeService.createCheckoutSession(amount, currency, orderNumber);
  }
}
