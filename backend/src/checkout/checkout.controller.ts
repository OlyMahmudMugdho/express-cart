import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('checkout')
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  async getOrders(@Request() req: any) {
    return this.checkoutService.getOrders(req.user.id);
  }

  @Get('initiate')
  @UseGuards(JwtAuthGuard)
  initiateCheckout(@Request() req: any, @Body() body: { addressId?: string }) {
    return this.checkoutService.initiateCheckout(req.user.id, body.addressId);
  }

  @Post('place-order')
  @UseGuards(JwtAuthGuard)
  placeOrder(
    @Request() req: any,
    @Body() body: { addressId?: string; notes?: string },
  ) {
    return this.checkoutService.createOrder(req.user.id, body.addressId, body.notes);
  }
}
