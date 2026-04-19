import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import {
  CreateProductDto,
  FashionProductDetailsDto,
  FootwearProductDetailsDto,
  DeviceProductDetailsDto,
  BookProductDetailsDto,
} from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductType } from './types';
import { FashionProductDetails } from './entities/fashion-product-details.entity';
import { FootwearProductDetails } from './entities/footwear-product-details.entity';
import { DeviceProductDetails } from './entities/device-product-details.entity';
import { BookProductDetails } from './entities/book-product-details.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(FashionProductDetails)
    private readonly fashionRepo: Repository<FashionProductDetails>,
    @InjectRepository(FootwearProductDetails)
    private readonly footwearRepo: Repository<FootwearProductDetails>,
    @InjectRepository(DeviceProductDetails)
    private readonly deviceRepo: Repository<DeviceProductDetails>,
    @InjectRepository(BookProductDetails)
    private readonly bookRepo: Repository<BookProductDetails>,
  ) {}

  async create(dto: CreateProductDto) {
    const product = this.productRepo.create({
      name: dto.name,
      sku: dto.sku,
      price: dto.price.toString(),
      description: dto.description ?? null,
      stock: dto.stock ?? 0,
      type: dto.type,
    });

    const saved = await this.productRepo.save(product);

    // create typed details
    switch (dto.type) {
      case ProductType.FASHION: {
        const details = dto.details as FashionProductDetailsDto | undefined;
        await this.fashionRepo.save(
          this.fashionRepo.create({
            product: saved,
            sizeOptions: details?.sizeOptions ?? null,
            material: details?.material ?? null,
            gender: details?.gender ?? null,
          }),
        );
        break;
      }
      case ProductType.FOOTWEAR: {
        const details = dto.details as FootwearProductDetailsDto | undefined;
        await this.footwearRepo.save(
          this.footwearRepo.create({
            product: saved,
            availableSizes: details?.availableSizes ?? null,
            brand: details?.brand ?? null,
            material: details?.material ?? null,
          }),
        );
        break;
      }
      case ProductType.DEVICE: {
        const details = dto.details as DeviceProductDetailsDto | undefined;
        await this.deviceRepo.save(
          this.deviceRepo.create({
            product: saved,
            specs: details?.specs ?? null,
            manufacturer: details?.manufacturer ?? null,
            model: details?.model ?? null,
          }),
        );
        break;
      }
      case ProductType.BOOK: {
        const details = dto.details as BookProductDetailsDto | undefined;
        await this.bookRepo.save(
          this.bookRepo.create({
            product: saved,
            author: details?.author ?? null,
            isbn: details?.isbn ?? null,
            pageCount: details?.pageCount ?? null,
            publisher: details?.publisher ?? null,
          }),
        );
        break;
      }
      default:
        break;
    }

    return this.findById(saved.id);
  }

  async findById(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: {
        fashionDetails: true,
        footwearDetails: true,
        deviceDetails: true,
        bookDetails: true,
        images: true,
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    product.name = dto.name ?? product.name;
    product.sku = dto.sku ?? product.sku;
    if (dto.price !== undefined && dto.price !== null) product.price = dto.price.toString();
    product.description = dto.description ?? product.description;
    if (dto.stock !== undefined && dto.stock !== null) product.stock = dto.stock;

    // If type changed, remove existing typed details
    if (dto.type && dto.type !== product.type) {
      product.type = dto.type;
      await Promise.all([
        this.fashionRepo.delete({ product: { id: product.id } }),
        this.footwearRepo.delete({ product: { id: product.id } }),
        this.deviceRepo.delete({ product: { id: product.id } }),
        this.bookRepo.delete({ product: { id: product.id } }),
      ]);
    }

    await this.productRepo.save(product);

    // Upsert typed details if provided
    if (dto.details) {
      switch (product.type) {
        case ProductType.FASHION: {
          const details = dto.details as FashionProductDetailsDto;
          await this.fashionRepo.save(
            this.fashionRepo.create({
              product: product,
              sizeOptions: details?.sizeOptions ?? null,
              material: details?.material ?? null,
              gender: details?.gender ?? null,
            }),
          );
          break;
        }
        case ProductType.FOOTWEAR: {
          const details = dto.details as FootwearProductDetailsDto;
          await this.footwearRepo.save(
            this.footwearRepo.create({
              product: product,
              availableSizes: details?.availableSizes ?? null,
              brand: details?.brand ?? null,
              material: details?.material ?? null,
            }),
          );
          break;
        }
        case ProductType.DEVICE: {
          const details = dto.details as DeviceProductDetailsDto;
          await this.deviceRepo.save(
            this.deviceRepo.create({
              product: product,
              specs: details?.specs ?? null,
              manufacturer: details?.manufacturer ?? null,
              model: details?.model ?? null,
            }),
          );
          break;
        }
        case ProductType.BOOK: {
          const details = dto.details as BookProductDetailsDto;
          await this.bookRepo.save(
            this.bookRepo.create({
              product: product,
              author: details?.author ?? null,
              isbn: details?.isbn ?? null,
              pageCount: details?.pageCount ?? null,
              publisher: details?.publisher ?? null,
            }),
          );
          break;
        }
        default:
          break;
      }
    }

    return this.findById(product.id);
  }

  async remove(id: string) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    await this.productRepo.remove(product);
    return { message: 'Product deleted' };
  }

  async list(query: { page?: number; limit?: number; type?: string; q?: string; sort?: string }) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, query.limit ?? 20);
    const qb = this.productRepo.createQueryBuilder('p');

    if (query.type) qb.andWhere('p.type = :type', { type: query.type });
    if (query.q) qb.andWhere('(p.name ILIKE :q OR p.description ILIKE :q)', { q: `%${query.q}%` });

    if (query.sort === 'price_asc') qb.orderBy('p.price', 'ASC');
    else if (query.sort === 'price_desc') qb.orderBy('p.price', 'DESC');
    else qb.orderBy('p.createdAt', 'DESC');

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }
}
