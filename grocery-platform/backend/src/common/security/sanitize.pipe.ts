import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value !== 'object' || value === null) {
      return this.sanitizeValue(value);
    }

    return this.sanitizeObject(value);
  }

  private sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          sanitized[key] = this.sanitizeObject(value);
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map((item) =>
            typeof item === 'object' && item !== null
              ? this.sanitizeObject(item)
              : this.sanitizeValue(item),
          );
        } else {
          sanitized[key] = this.sanitizeValue(value);
        }
      }
    }

    return sanitized;
  }

  private sanitizeValue(value: any): any {
    if (typeof value !== 'string') {
      return value;
    }

    // Remove potential XSS attack vectors
    let sanitized = value
      // Remove script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove event handlers
      .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
      // Remove javascript: protocol
      .replace(/javascript:/gi, '')
      // Remove data: protocol (potential XSS vector)
      .replace(/data:/gi, '')
      // Encode HTML entities
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
  }
}

// Stricter sanitization for user input (no HTML allowed)
@Injectable()
export class StrictSanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value !== 'object' || value === null) {
      return this.sanitizeValue(value);
    }

    return this.sanitizeObject(value);
  }

  private sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          sanitized[key] = this.sanitizeObject(value);
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map((item) =>
            typeof item === 'object' && item !== null
              ? this.sanitizeObject(item)
              : this.sanitizeValue(item),
          );
        } else {
          sanitized[key] = this.sanitizeValue(value);
        }
      }
    }

    return sanitized;
  }

  private sanitizeValue(value: any): any {
    if (typeof value !== 'string') {
      return value;
    }

    // Strip ALL HTML tags
    let sanitized = value.replace(/<[^>]*>/g, '');

    // Remove any remaining suspicious patterns
    sanitized = sanitized
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+=/gi, '');

    // Trim and normalize whitespace
    sanitized = sanitized.trim().replace(/\s+/g, ' ');

    return sanitized;
  }
}
