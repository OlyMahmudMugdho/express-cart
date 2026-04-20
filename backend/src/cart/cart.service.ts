import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private itemRepo: Repository<CartItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  private async getOrCreateCart(userId: string) {
    let cart = await this.cartRepo.findOne({ where: { userId }, relations: ['items', 'items.product', 'items.product.images'] });
    if (!cart) {
      cart = this.cartRepo.create({ userId });
      await this.cartRepo.save(cart);
    }
    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    return cart;
  }

  async addItem(userId: string, productId: string, quantity: number = 1) {
    const product = await this.productRepo.findOne({ where: { id: productId, isActive: true } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.stockQuantity < quantity) throw new BadRequestException('Insufficient stock');

    const cart = await this.getOrCreateCart(userId);
    let item = await this.itemRepo.findOne({ where: { cartId: cart.id, productId } });

    const newQuantity = item ? item.quantity + quantity : quantity;
    if (product.stockQuantity < newQuantity) throw new BadRequestException('Insufficient stock');

    if (item) {
      item.quantity = newQuantity;
      item.total = Number(item.price) * item.quantity;
    } else {
      item = this.itemRepo.create({
        cartId: cart.id,
        productId,
        quantity: newQuantity,
        price: product.price,
        total: Number(product.price) * newQuantity,
      });
    }
    await this.itemRepo.save(item);
    await this.updateCartTotal(cart.id);
    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.itemRepo.findOne({ where: { id: itemId, cartId: cart.id }, relations: ['product'] });
    if (!item) throw new NotFoundException('Cart item not found');
    if (item.product.stockQuantity < quantity) throw new BadRequestException('Insufficient stock');

    item.quantity = quantity;
    item.total = Number(item.price) * quantity;
    await this.itemRepo.save(item);
    await this.updateCartTotal(cart.id);
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.itemRepo.findOne({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new NotFoundException('Cart item not found');
    await this.itemRepo.remove(item);
    await this.updateCartTotal(cart.id);
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.itemRepo.delete({ cartId: cart.id });
    cart.total = 0;
    await this.cartRepo.save(cart);
    return { message: 'Cart cleared' };
  }

  private async updateCartTotal(cartId: string) {
    const cart = await this.cartRepo.findOne({ where: { id: cartId } });
    if (!cart) return;
    const result = await this.itemRepo
      .createQueryBuilder('item')
      .select('SUM(item.total)', 'total')
      .where('item.cartId = :cartId', { cartId })
      .getRawOne();
    cart.total = Number(result?.total) || 0;
    await this.cartRepo.save(cart);
  }
}
