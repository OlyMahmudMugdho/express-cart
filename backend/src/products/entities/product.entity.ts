import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { ProductImage } from './product-image.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  compareAtPrice: number;

  @Column({ default: 0 })
  stockQuantity: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ nullable: true })
  sku: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  weight: number;

  @Column({ nullable: true })
  weightUnit: string;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  soldCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
