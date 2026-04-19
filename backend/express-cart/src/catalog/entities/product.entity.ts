import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookProductDetails } from './book-product-details.entity';
import { DeviceProductDetails } from './device-product-details.entity';
import { FashionProductDetails } from './fashion-product-details.entity';
import { FootwearProductDetails } from './footwear-product-details.entity';
import { ProductImage } from '../../media/entities/product-image.entity';
import { ProductType } from '../types';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  sku: string;

  @Column('numeric')
  price: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'varchar' })
  type: ProductType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Optional one-to-one relations to typed detail tables
  @OneToOne(() => FashionProductDetails, (d) => d.product, { nullable: true })
  fashionDetails?: FashionProductDetails;

  @OneToOne(() => FootwearProductDetails, (d) => d.product, { nullable: true })
  footwearDetails?: FootwearProductDetails;

  @OneToOne(() => DeviceProductDetails, (d) => d.product, { nullable: true })
  deviceDetails?: DeviceProductDetails;

  @OneToOne(() => BookProductDetails, (d) => d.product, { nullable: true })
  bookDetails?: BookProductDetails;

  @OneToMany(() => ProductImage, (image) => image.product)
  images?: ProductImage[];
}
