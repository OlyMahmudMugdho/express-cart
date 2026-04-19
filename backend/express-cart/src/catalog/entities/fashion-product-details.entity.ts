import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('fashion_product_details')
export class FashionProductDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Product, (product) => product.fashionDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column('simple-array', { nullable: true })
  sizeOptions: string[] | null;

  @Column({ type: 'varchar', nullable: true })
  material: string | null;

  @Column({ type: 'varchar', nullable: true })
  gender: string | null;
}
