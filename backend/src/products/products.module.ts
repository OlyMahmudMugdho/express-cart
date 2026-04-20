import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { CategoriesController } from './categories.controller';
import { ProductsService } from './products.service';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Product, ProductImage])],
  controllers: [ProductsController, CategoriesController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
