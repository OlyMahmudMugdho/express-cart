import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(ProductImage) private imageRepo: Repository<ProductImage>,
  ) {}

  // Category CRUD
  async createCategory(data: Partial<Category>) {
    if (!data.name) throw new BadRequestException('Name is required');
    const slug = data.slug || generateSlug(data.name);
    const existing = await this.categoryRepo.findOne({ where: { slug } });
    if (existing) throw new ConflictException('Category slug already exists');
    const category = this.categoryRepo.create({ ...data, slug });
    return this.categoryRepo.save(category);
  }

  async findAllCategories() {
    return this.categoryRepo.find({ where: { isActive: true }, order: { sortOrder: 'ASC', name: 'ASC' } });
  }

  async findCategoryById(id: string) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async updateCategory(id: string, data: Partial<Category>) {
    const category = await this.findCategoryById(id);
    if (data.name && !data.slug) {
      data.slug = generateSlug(data.name);
    }
    Object.assign(category, data);
    return this.categoryRepo.save(category);
  }

  async deleteCategory(id: string) {
    const category = await this.findCategoryById(id);
    await this.categoryRepo.remove(category);
    return { message: 'Category deleted' };
  }

  // Product CRUD
  async createProduct(data: Partial<Product>) {
    if (!data.name) throw new BadRequestException('Name is required');
    const slug = data.slug || generateSlug(data.name);
    const existing = await this.productRepo.findOne({ where: { slug } });
    if (existing) throw new ConflictException('Product slug already exists');
    const product = this.productRepo.create(data);
    return this.productRepo.save(product);
  }

  async findAllProducts(query: { page?: number; limit?: number; categoryId?: string; search?: string; sort?: string; minPrice?: number; maxPrice?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const qb = this.productRepo.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.isActive = :isActive', { isActive: true });

    if (query.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId: query.categoryId });
    }
    if (query.search) {
      qb.andWhere('(product.name ILIKE :search OR product.description ILIKE :search)', { search: `%${query.search}%` });
    }
    if (query.minPrice) {
      qb.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
    }
    if (query.maxPrice) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    const sortMap: Record<string, { column: string, order: 'ASC' | 'DESC' }> = {
      'price_asc': { column: 'product.price', order: 'ASC' },
      'price_desc': { column: 'product.price', order: 'DESC' },
      'newest': { column: 'product.createdAt', order: 'DESC' },
      'name': { column: 'product.name', order: 'ASC' },
    };

    if (query.sort && sortMap[query.sort]) {
      qb.orderBy(sortMap[query.sort].column, sortMap[query.sort].order);
    } else {
      qb.orderBy('product.createdAt', 'DESC');
    }

    qb.skip((page - 1) * limit).take(limit);
    const [products, total] = await qb.getManyAndCount();
    return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findProductById(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'images'],
    });
    if (!product) throw new NotFoundException('Product not found');
    product.viewCount++;
    await this.productRepo.save(product);
    return product;
  }

  async updateProduct(id: string, data: Partial<Product>) {
    const product = await this.findProductById(id);
    if (data.name && !data.slug) {
      data.slug = generateSlug(data.name);
    }

    if (data.images) {
      const existingImages = product.images || [];
      const newImagesData = data.images;

      // Identify images to delete (those in existingImages but not in newImagesData by URL)
      const newUrls = new Set(newImagesData.map(img => img.url));
      const imagesToDelete = existingImages.filter(img => !newUrls.has(img.url));
      
      if (imagesToDelete.length > 0) {
        await this.imageRepo.remove(imagesToDelete);
      }

      // Map new images to remaining existing ones or create new ones
      const imagesToSave = newImagesData.map((newImg) => {
        const existing = existingImages.find((ei) => ei.url === newImg.url);
        if (existing) {
          return Object.assign(existing, newImg);
        }
        return this.imageRepo.create({ ...newImg, productId: id });
      });

      product.images = imagesToSave;
      delete data.images;
    }

    Object.assign(product, data);
    return this.productRepo.save(product);
  }

  async deleteProduct(id: string) {
    const product = await this.findProductById(id);
    product.isActive = false;
    return this.productRepo.save(product);
  }

  // Product Images
  async addProductImage(productId: string, imageData: Partial<ProductImage>) {
    const product = await this.findProductById(productId);
    if (imageData.isPrimary) {
      await this.imageRepo.update({ productId, isPrimary: true }, { isPrimary: false });
    }
    const image = this.imageRepo.create({ ...imageData, productId });
    return this.imageRepo.save(image);
  }

  async deleteProductImage(productId: string, imageId: string) {
    const image = await this.imageRepo.findOne({ where: { id: imageId, productId } });
    if (!image) throw new NotFoundException('Image not found');
    await this.imageRepo.remove(image);
    return { message: 'Image deleted' };
  }
}
