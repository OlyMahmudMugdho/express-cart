import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('book_product_details')
export class BookProductDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Product, (product) => product.bookDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'varchar', nullable: true })
  author: string | null;

  @Column({ type: 'varchar', nullable: true })
  isbn: string | null;

  @Column({ type: 'int', nullable: true })
  pageCount: number | null;

  @Column({ type: 'varchar', nullable: true })
  publisher: string | null;
}
