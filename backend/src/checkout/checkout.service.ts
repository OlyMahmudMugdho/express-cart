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
import { StripeService } from '../stripe/stripe.service';

export type PaymentMethod = 'cod' | 'stripe';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private cartItemRepo: Repository<CartItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Address) private addressRepo: Repository<Address>,
    private stripeService: StripeService,
  ) {}

  async getOrders(userId: string) {
    return this.orderRepo.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllOrders() {
    return this.orderRepo.find({ order: { createdAt: 'DESC' }, relations: ['user'] });
  }

  async findOneOrder(id: string) {
    const order = await this.orderRepo.findOne({ 
      where: { id },
      relations: ['items', 'user']
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    return this.orderRepo.save(order);
  }

  async getOrderStatus(orderNumber: string) {
    const order = await this.orderRepo.findOne({ where: { orderNumber } });
    if (!order) throw new NotFoundException('Order not found');
    return { status: order.status };
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

  async createOrder(userId: string, addressId?: string, notes?: string, newAddress?: any, paymentMethod: PaymentMethod = 'cod') {
    console.log('=== CREATE ORDER ===');
    console.log('paymentMethod:', paymentMethod);
    console.log('addressId:', addressId);
    console.log('newAddress:', newAddress);
    
    const cart = await this.cartRepo.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });
    console.log('Cart found:', !!cart);
    console.log('Cart items:', cart?.items?.length);
    
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let shippingAddress = '';
    let finalAddressId = addressId;

    if (newAddress && typeof newAddress === 'object') {
      console.log('Saving new address...');
      const savedAddress = this.addressRepo.create({
        ...newAddress,
        userId,
        isDefault: false,
      });
      const savedResult = await this.addressRepo.save(savedAddress);
      const saved = Array.isArray(savedResult) ? savedResult[0] : savedResult;
      finalAddressId = saved.id;
      shippingAddress = `${saved.street}, ${saved.city}, ${saved.state} ${saved.postalCode}, ${saved.country}`;
    } else if (addressId) {
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
    let stripePaymentIntentId = 'cod';
    let paymentStatus = PaymentStatus.PENDING;
    let checkoutSessionUrl = null;
    let checkoutSessionId = null;

    if (paymentMethod === 'stripe') {
      try {
        const session = await this.stripeService.createCheckoutSession(total, 'usd', orderNumber);
        checkoutSessionUrl = session.url;
        checkoutSessionId = session.id;
        stripePaymentIntentId = session.id;  // Use session ID for now
        paymentStatus = PaymentStatus.PENDING;
        console.log('Stripe Checkout Session URL:', checkoutSessionUrl);
        console.log('Stripe Checkout Session ID:', checkoutSessionId);
      } catch (stripeError: any) {
        console.error('Stripe error:', stripeError);
        throw new BadRequestException('Failed to create checkout session: ' + stripeError.message);
      }
    }

    const order = this.orderRepo.create({
      orderNumber,
      userId,
      subtotal,
      shippingCost,
      tax,
      total,
      status: OrderStatus.PENDING,
      shippingAddressId: finalAddressId || undefined,
      shippingAddress,
      notes: paymentMethod === 'cod' ? 'Cash on Delivery' : notes,
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
      stripePaymentIntentId,
      status: paymentStatus,
      amount: total,
      currency: 'usd',
    });
    await this.paymentRepo.save(payment);

    console.log('Removing cart items for cart:', cart.id);
    const cartItems = await this.cartItemRepo.find({ where: { cartId: cart.id } });
    await this.cartItemRepo.remove(cartItems);
    
    cart.total = 0;
    cart.items = [];
    await this.cartRepo.save(cart);

    return { 
      order: { 
        id: order.id, 
        orderNumber: order.orderNumber, 
        total: order.total 
      }, 
      payment, 
      checkoutSessionUrl,
      checkoutSessionId,
    };
  }
}
