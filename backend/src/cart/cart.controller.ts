import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@Request() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  addItem(
    @Request() req: any,
    @Body() body: { productId: string; quantity?: number },
  ) {
    return this.cartService.addItem(req.user.id, body.productId, body.quantity);
  }

  @Patch('items/:id')
  updateItem(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateItem(req.user.id, id, body.quantity);
  }

  @Delete('items/:id')
  removeItem(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.cartService.removeItem(req.user.id, id);
  }

  @Delete()
  clearCart(@Request() req: any) {
    return this.cartService.clearCart(req.user.id);
  }
}
