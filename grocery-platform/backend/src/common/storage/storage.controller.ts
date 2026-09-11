import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

class SignedUrlRequestDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsOptional()
  @IsString()
  folder?: string = 'products';
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STORE_MANAGER, Role.SUPER_ADMIN)
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('signed-url')
  async getSignedUploadUrl(@Body() dto: SignedUrlRequestDto) {
    return this.storageService.getSignedUploadUrl(dto.fileName, dto.mimeType, dto.folder);
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(@UploadedFiles() files: Array<{ buffer: Buffer; originalname: string; mimetype: string }>) {
    const urls: string[] = [];

    for (const file of files || []) {
      const result = await this.storageService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        'products',
      );
      urls.push(result.url);
    }

    return { urls };
  }
}
