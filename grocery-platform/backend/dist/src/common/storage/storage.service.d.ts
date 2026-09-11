import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private configService;
    private readonly logger;
    private readonly bucketName;
    private readonly s3Endpoint;
    private readonly uploadsDir;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    uploadFile(fileBuffer: Buffer, originalName: string, mimeType: string, folder?: string): Promise<{
        url: string;
        key: string;
    }>;
    getSignedUploadUrl(fileName: string, mimeType: string, folder?: string): Promise<{
        uploadUrl: string;
        publicUrl: string;
        key: string;
    }>;
}
