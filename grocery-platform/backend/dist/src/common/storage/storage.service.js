"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
let StorageService = StorageService_1 = class StorageService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(StorageService_1.name);
        this.bucketName = this.configService.get('AWS_BUCKET_NAME', 'freshcart-media');
        this.s3Endpoint = this.configService.get('S3_ENDPOINT', 'http://localhost:9000');
        this.uploadsDir = path.join(process.cwd(), 'uploads');
        this.baseUrl = this.configService.get('BASE_URL', 'http://localhost:4000');
        if (!fs.existsSync(this.uploadsDir)) {
            fs.mkdirSync(this.uploadsDir, { recursive: true });
        }
    }
    async uploadFile(fileBuffer, originalName, mimeType, folder = 'products') {
        const fileExt = originalName.split('.').pop() || 'jpg';
        const uniqueKey = `${folder}-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExt}`;
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
    async getSignedUploadUrl(fileName, mimeType, folder = 'products') {
        const fileExt = fileName.split('.').pop() || 'jpg';
        const key = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExt}`;
        const uploadUrl = `${this.s3Endpoint}/${this.bucketName}/${key}`;
        return {
            uploadUrl,
            publicUrl: uploadUrl,
            key,
        };
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map