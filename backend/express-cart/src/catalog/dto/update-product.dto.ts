import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import {
  BookProductDetailsDto,
  DeviceProductDetailsDto,
  FashionProductDetailsDto,
  FootwearProductDetailsDto,
} from './create-product.dto';
import { ProductType } from '../types';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  details?:
    | FashionProductDetailsDto
    | FootwearProductDetailsDto
    | DeviceProductDetailsDto
    | BookProductDetailsDto;
}
