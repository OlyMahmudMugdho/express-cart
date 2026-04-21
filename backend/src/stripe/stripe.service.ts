import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class StripeService {
  private stripe: any;
  private readonly logger = new Logger(StripeService.name);

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      this.logger.error('STRIPE_SECRET_KEY is not defined!');
    } else {
      this.logger.log('Stripe API key loaded: ' + apiKey.substring(0, 10) + '...');
    }
    const Stripe = require('stripe');
    this.stripe = new Stripe(apiKey || 'sk_test_placeholder', {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async createPaymentIntent(amount: number, currency: string = 'usd') {
    this.logger.log('Creating payment intent for amount: ' + amount);
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      this.logger.log(`PaymentIntent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error('Failed to create PaymentIntent', error.stack);
      throw error;
    }
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error('Failed to retrieve PaymentIntent', error.stack);
      throw error;
    }
  }

  async confirmPaymentIntent(paymentIntentId: string) {
    try {
      return await this.stripe.paymentIntents.confirm(paymentIntentId);
    } catch (error) {
      this.logger.error('Failed to confirm PaymentIntent', error.stack);
      throw error;
    }
  }

  async cancelPaymentIntent(paymentIntentId: string) {
    try {
      return await this.stripe.paymentIntents.cancel(paymentIntentId);
    } catch (error) {
      this.logger.error('Failed to cancel PaymentIntent', error.stack);
      throw error;
    }
  }

  async createRefund(paymentIntentId: string, amount?: number) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        ...(amount && { amount: Math.round(amount * 100) }),
      });
      this.logger.log(`Refund created: ${refund.id}`);
      return refund;
    } catch (error) {
      this.logger.error('Failed to create refund', error.stack);
      throw error;
    }
  }

  async createCustomer(email: string, name?: string) {
    try {
      const customer = await this.stripe.customers.create({ email, name });
      this.logger.log(`Customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      this.logger.error('Failed to create customer', error.stack);
      throw error;
    }
  }

  async createCheckoutSession(amount: number, currency: string = 'usd', orderNumber?: string) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: `Order ${orderNumber || 'Payment'}`,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cart`,
      });
      this.logger.log(`Checkout session created: ${session.id}, URL: ${session.url}`);
      return session;
    } catch (error) {
      this.logger.error('Failed to create checkout session', error.stack);
      throw error;
    }
  }
}