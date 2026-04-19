import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductImage } from './entities/product-image.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,
  ) {}

  async saveLocalFile(file: any, productId?: string) {
    // Prefer Cloudinary when CLOUDINARY_URL is configured. Fall back to local storage.
    if (process.env.CLOUDINARY_URL) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const cloudinary = require('cloudinary').v2;
        const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const res = await cloudinary.uploader.upload(dataUri, { folder: 'express-cart' });
        const url = res.secure_url ?? res.url;
        const storageKey = res.public_id ?? `${Date.now()}_${file.originalname}`;
        const img = this.imageRepo.create({
          url,
          productId: productId ?? null,
          storageKey,
          storageProvider: 'cloudinary',
          mimeType: file.mimetype ?? null,
          sizeBytes: file.size ?? null,
          width: res.width ?? null,
          height: res.height ?? null,
        });
        return this.imageRepo.save(img);
      } catch (e) {
        // Fall back to local storage on any error
      }
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    const filename = `${Date.now()}_${file.originalname}`;
    const dest = path.join(uploadsDir, filename);
    await fs.promises.writeFile(dest, file.buffer);
    const url = `/uploads/${filename}`;

    const img = this.imageRepo.create({
      url,
      productId: productId ?? null,
      storageKey: filename,
      storageProvider: 'local',
      mimeType: file.mimetype ?? null,
      sizeBytes: file.size ?? null,
    });
    return this.imageRepo.save(img);
  }

  async deleteImage(id: string) {
    const img = await this.imageRepo.findOne({ where: { id } });
    if (!img) return null;

    // try delete from cloud provider when applicable
    try {
      if (img.storageProvider === 'cloudinary' && img.storageKey) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const cloudinary = require('cloudinary').v2;
        await cloudinary.uploader.destroy(img.storageKey);
      } else {
        const filepath = path.join(process.cwd(), img.url.replace(/^\//, ''));
        if (fs.existsSync(filepath)) await fs.promises.unlink(filepath);
      }
    } catch {}

    await this.imageRepo.remove(img);
    return { message: 'Image deleted' };
  }
}
