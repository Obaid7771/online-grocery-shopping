import { StorageService } from './storage.service';
declare class SignedUrlRequestDto {
    fileName: string;
    mimeType: string;
    folder?: string;
}
export declare class StorageController {
    private readonly storageService;
    constructor(storageService: StorageService);
    getSignedUploadUrl(dto: SignedUrlRequestDto): Promise<{
        uploadUrl: string;
        publicUrl: string;
        key: string;
    }>;
    uploadFiles(files: Array<{
        buffer: Buffer;
        originalname: string;
        mimetype: string;
    }>): Promise<{
        urls: string[];
    }>;
}
export {};
