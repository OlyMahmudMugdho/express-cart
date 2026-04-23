import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, In } from 'typeorm';
import { Order, OrderStatus } from '../checkout/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../auth/entities/user.entity';
import { Role } from '../auth/entities/role.enum';
import { Category } from '../products/entities/category.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  async getStats(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'monthly':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const [
      totalOrders, 
      totalProducts, 
      totalCustomers, 
      totalCategories,
      recentOrders,
      lowStockProducts,
      topSellingProducts,
      orderStatusCounts,
      salesTrends,
      userSignupsTrends,
    ] = await Promise.all([
      this.orderRepo.count(),
      this.productRepo.count(),
      this.userRepo.count({ where: { role: Role.CUSTOMER } }),
      this.categoryRepo.count(),
      this.orderRepo.find({
        order: { createdAt: 'DESC' },
        take: 10,
        relations: ['user'],
      }),
      this.productRepo.find({
        where: { stockQuantity: Between(0, 10) },
        take: 10,
        order: { stockQuantity: 'ASC' },
        relations: ['images']
      }),
      this.productRepo.find({
        order: { soldCount: 'DESC' },
        take: 10,
        relations: ['images']
      }),
      // Status breakdown
      this.orderRepo.createQueryBuilder('order')
        .select('order.status', 'status')
        .addSelect('COUNT(order.id)', 'count')
        .groupBy('order.status')
        .getRawMany(),
      // Sales Trends
      this.getSalesTrends(period),
      // User Trends
      this.getUserTrends(period),
    ]);

    console.log('--- DASHBOARD SERVICE DEBUG ---');
    console.log('totalOrders:', totalOrders);
    console.log('totalProducts:', totalProducts);
    console.log('totalCustomers:', totalCustomers);
    console.log('totalCategories:', totalCategories);
    console.log('period:', period);
    console.log('-------------------------------');

    // Period specific revenue
    const periodOrders = await this.orderRepo.find({
      where: {
        createdAt: MoreThan(startDate),
        status: In([OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED])
      }
    });
    
    // Total Revenue (all time successful)
    const allSuccessfulOrders = await this.orderRepo.find({
      where: {
        status: In([OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED])
      }
    });

    const totalRevenue = allSuccessfulOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const periodRevenue = periodOrders.reduce((sum, order) => sum + Number(order.total), 0);

    // Get categories with product counts
    const categoriesData = await this.categoryRepo.createQueryBuilder('category')
      .leftJoin('category.products', 'product')
      .select('category.name', 'name')
      .addSelect('COUNT(product.id)', 'productCount')
      .groupBy('category.id')
      .addGroupBy('category.name')
      .getRawMany();

    return {
      stats: {
        totalOrders,
        totalProducts,
        totalCustomers,
        totalCategories,
        totalRevenue,
        periodRevenue,
      },
      charts: {
        salesTrends,
        userTrends: userSignupsTrends,
        orderStatus: orderStatusCounts,
        categoryDistribution: categoriesData,
      },
      inventory: {
        lowStock: lowStockProducts,
        topSelling: topSellingProducts,
      },
      recentOrders,
    };
  }

  private async getSalesTrends(period: string) {
    let dateFormat: string;
    let limit: number;

    if (period === 'daily') {
      dateFormat = 'YYYY-MM-DD HH24:00';
      limit = 24;
    } else if (period === 'yearly') {
      dateFormat = 'YYYY-MM';
      limit = 12;
    } else {
      dateFormat = 'YYYY-MM-DD';
      limit = 30;
    }

    return this.orderRepo.createQueryBuilder('order')
      .select(`TO_CHAR(order.createdAt, '${dateFormat}')`, 'label')
      .addSelect('SUM(order.total)', 'value')
      .where('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .groupBy('label')
      .orderBy('label', 'ASC')
      .limit(limit)
      .getRawMany();
  }

  private async getUserTrends(period: string) {
    let dateFormat: string;
    if (period === 'daily') dateFormat = 'YYYY-MM-DD HH24:00';
    else if (period === 'yearly') dateFormat = 'YYYY-MM';
    else dateFormat = 'YYYY-MM-DD';

    return this.userRepo.createQueryBuilder('user')
      .select(`TO_CHAR(user.createdAt, '${dateFormat}')`, 'label')
      .addSelect('COUNT(user.id)', 'value')
      .where('user.role = :role', { role: Role.CUSTOMER })
      .groupBy('label')
      .orderBy('label', 'ASC')
      .limit(30)
      .getRawMany();
  }
}
