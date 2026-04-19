import { Controller, Post, UseInterceptors, UploadedFile, Delete, Param, UseGuards, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Uploads')
@Controller({ path: 'uploads', version: '1' })
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('images')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: any, @Body('productId') productId?: string) {
    return this.mediaService.saveLocalFile(file, productId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('images/:id')
  async delete(@Param('id') id: string) {
    return this.mediaService.deleteImage(id);
  }
}
