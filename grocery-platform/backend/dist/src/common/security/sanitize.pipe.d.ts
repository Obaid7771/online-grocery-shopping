import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
export declare class SanitizePipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata): any;
    private sanitizeObject;
    private sanitizeValue;
}
export declare class StrictSanitizePipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata): any;
    private sanitizeObject;
    private sanitizeValue;
}
