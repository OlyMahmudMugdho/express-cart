import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { Address } from '../users/entities/address.entity';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private itemCartRepo: Repository<CartItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Address) private addressRepo: Repository<Address>,
  ) {}

  async getOrders(userId: string) {
    return this.orderRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllOrders() {
    return this.orderRepo.find({ order: { createdAt: 'DESC' } });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    return this.orderRepo.save(order);
  }

  async initiateCheckout(userId: string, addressId?: string) {
    const cart = await this.cartRepo.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let shippingAddress = '';
    if (addressId) {
      const address = await this.addressRepo.findOne({ where: { id: addressId, userId } });
      if (address) {
        shippingAddress = `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
      }
    }

    const subtotal = cart.total;
    const shippingCost = subtotal > 100 ? 0 : 10;
    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax;

    return {
      items: cart.items,
      subtotal,
      shippingCost,
      tax,
      total,
      shippingAddress,
    };
  }

  async createOrder(userId: string, addressId?: string, notes?: string) {
    const cart = await this.cartRepo.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let shippingAddress = '';
    if (addressId) {
      const address = await this.addressRepo.findOne({ where: { id: addressId, userId } });
      if (address) {
        shippingAddress = `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
      }
    }

    const subtotal = Number(cart.total);
    const shippingCost = subtotal > 100 ? 0 : 10;
    const tax = Number((subtotal * 0.08).toFixed(2));
    const total = Number((subtotal + shippingCost + tax).toFixed(2));

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const order = this.orderRepo.create({
      orderNumber,
      userId,
      subtotal,
      shippingCost,
      tax,
      total,
      status: OrderStatus.PENDING,
      shippingAddressId: addressId || undefined,
      shippingAddress,
      notes,
    });
    await this.orderRepo.save(order);

    for (const item of cart.items) {
      const orderItem = this.itemRepo.create({
        orderId: order.id,
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.images?.[0]?.url,
        sku: item.product.sku || '',
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      });
      await this.itemRepo.save(orderItem);

      await this.productRepo.increment({ id: item.productId }, 'soldCount', item.quantity);
      await this.productRepo.decrement({ id: item.productId }, 'stockQuantity', item.quantity);
    }

    const payment = this.paymentRepo.create({
      orderId: order.id,
      stripePaymentIntentId: 'cod',
      status: PaymentStatus.PENDING,
      amount: total,
      currency: 'usd',
    });
    await this.paymentRepo.save(payment);

    await this.itemCartRepo.delete({ cartId: cart.id });
    cart.total = 0;
    await this.cartRepo.save(cart);

    return { order, payment };
  }
}
