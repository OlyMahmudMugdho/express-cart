import { Controller, Get, Post, Patch, Body, UseGuards, Request, Query, Param, ParseUUIDPipe } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/entities/role.enum';
import { OrderStatus } from './entities/order.entity';

@Controller('checkout')
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Get('all-orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async findAllOrders() {
    return this.checkoutService.findAllOrders();
  }

  @Get('orders/:id/details')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async findOneOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.checkoutService.findOneOrder(id);
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  async getOrders(@Request() req: any) {
    console.log('>>> getOrders called with user:', req.user);
    return this.checkoutService.getOrders(req.user.id);
  }

  @Get('initiate')
  @UseGuards(JwtAuthGuard)
  initiateCheckout(@Request() req: any, @Query() query: { addressId?: string }) {
    return this.checkoutService.initiateCheckout(req.user.id, query.addressId);
  }

  @Get('orders/:orderNumber/status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Param('orderNumber') orderNumber: string) {
    return this.checkoutService.getOrderStatus(orderNumber);
  }

  @Patch('orders/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() body: { status: OrderStatus }) {
    return this.checkoutService.updateOrderStatus(id, body.status);
  }

  @Post('place-order')
  @UseGuards(JwtAuthGuard)
  async placeOrder(
    @Request() req: any,
    @Body() body: { addressId?: string; notes?: string; newAddress?: any; paymentMethod?: 'cod' | 'stripe' },
  ) {
    try {
      return await this.checkoutService.createOrder(req.user.id, body.addressId, body.notes, body.newAddress, body.paymentMethod || 'cod');
    } catch (error) {
      console.error('Place order error:', error);
      throw error;
    }
  }
}
