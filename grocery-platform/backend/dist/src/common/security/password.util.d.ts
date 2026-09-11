export declare class PasswordUtil {
    static hash(password: string): Promise<string>;
    static compare(plainPassword: string, hashedPassword: string): Promise<boolean>;
    static validateStrength(password: string): {
        valid: boolean;
        errors: string[];
    };
    static generateToken(length?: number): string;
    static generateOtp(length?: number): string;
    static hashToken(token: string): string;
}
