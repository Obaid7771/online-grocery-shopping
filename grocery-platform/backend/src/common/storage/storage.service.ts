import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucketName: string;
  private readonly s3Endpoint: string;
  private readonly uploadsDir: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME', 'freshcart-media');
    this.s3Endpoint = this.configService.get<string>('S3_ENDPOINT', 'http://localhost:9000');
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:4000');

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  // Upload file buffer - saves locally for development
  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    folder = 'products',
  ): Promise<{ url: string; key: string }> {
    const fileExt = originalName.split('.').pop() || 'jpg';
    const uniqueKey = `${folder}-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExt}`;

    // Save locally for development
    const folderPath = path.join(this.uploadsDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, uniqueKey);
    fs.writeFileSync(filePath, fileBuffer);

    const publicUrl = `${this.baseUrl}/uploads/${folder}/${uniqueKey}`;
    this.logger.log(`Uploaded media asset to ${publicUrl}`);

    return {
      url: publicUrl,
      key: uniqueKey,
    };
  }

  // Generate signed upload URL for direct client upload
  async getSignedUploadUrl(fileName: string, mimeType: string, folder = 'products') {
    const fileExt = fileName.split('.').pop() || 'jpg';
    const key = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExt}`;
    const uploadUrl = `${this.s3Endpoint}/${this.bucketName}/${key}`;

    return {
      uploadUrl,
      publicUrl: uploadUrl,
      key,
    };
  }
}
