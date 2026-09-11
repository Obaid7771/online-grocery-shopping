"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordUtil = void 0;
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const SALT_ROUNDS = 12;
class PasswordUtil {
    static async hash(password) {
        return bcrypt.hash(password, SALT_ROUNDS);
    }
    static async compare(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
    static validateStrength(password) {
        const errors = [];
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (password.length > 128) {
            errors.push('Password must be at most 128 characters long');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one digit');
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        const commonPasswords = [
            'password',
            '123456',
            'qwerty',
            'letmein',
            'admin',
            'welcome',
        ];
        if (commonPasswords.includes(password.toLowerCase())) {
            errors.push('Password is too common and easily guessable');
        }
        if (/(.)\1{2,}/.test(password)) {
            errors.push('Password should not contain more than 2 consecutive identical characters');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    static generateToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }
    static generateOtp(length = 6) {
        const digits = '0123456789';
        let otp = '';
        const randomBytes = crypto.randomBytes(length);
        for (let i = 0; i < length; i++) {
            otp += digits[randomBytes[i] % 10];
        }
        return otp;
    }
    static hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
}
exports.PasswordUtil = PasswordUtil;
//# sourceMappingURL=password.util.js.map