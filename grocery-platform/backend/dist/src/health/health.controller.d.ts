import { PrismaService } from '../common/prisma/prisma.service';
interface HealthCheckResult {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    uptime: number;
    version: string;
    checks: {
        database: {
            status: 'up' | 'down';
            latency?: number;
        };
        memory: {
            heapUsed: number;
            heapTotal: number;
            rss: number;
        };
    };
}
export declare class HealthController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    check(): Promise<HealthCheckResult>;
    live(): {
        status: string;
        timestamp: string;
    };
    ready(): Promise<{
        status: string;
        timestamp: string;
        message?: undefined;
    } | {
        status: string;
        message: string;
        timestamp?: undefined;
    }>;
}
export {};
