import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Payment } from './entities/payment.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { Address } from '../users/entities/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Payment, Cart, CartItem, Product, Address])],
  controllers: [CheckoutController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}
