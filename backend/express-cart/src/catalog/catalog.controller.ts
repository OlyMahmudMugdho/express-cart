import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogListQueryDto } from './dto/catalog-list-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionGuard } from '../rbac/guards/permission.guard/permission.guard';
import { Permissions } from '../rbac/decorators/permissions.decorator/permissions.decorator';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Catalog')
@Controller('')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  async list(@Query() query: CatalogListQueryDto) {
    return this.catalogService.list(query);
  }

  @Get('products/:id')
  async get(@Param('id') id: string) {
    return this.catalogService.findById(id);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @ApiBearerAuth()
  @Permissions('catalog:products:write')
  @Post('admin/products')
  async create(@Body() dto: CreateProductDto) {
    return this.catalogService.create(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @ApiBearerAuth()
  @Permissions('catalog:products:write')
  @Patch('admin/products/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.catalogService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @ApiBearerAuth()
  @Permissions('catalog:products:write')
  @Delete('admin/products/:id')
  async remove(@Param('id') id: string) {
    return this.catalogService.remove(id);
  }
}
