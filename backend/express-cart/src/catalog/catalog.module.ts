import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { Product } from './entities/product.entity';
import { FashionProductDetails } from './entities/fashion-product-details.entity';
import { FootwearProductDetails } from './entities/footwear-product-details.entity';
import { DeviceProductDetails } from './entities/device-product-details.entity';
import { BookProductDetails } from './entities/book-product-details.entity';
import { ProductImage } from '../media/entities/product-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      FashionProductDetails,
      FootwearProductDetails,
      DeviceProductDetails,
      BookProductDetails,
      ProductImage,
    ]),
  ],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
