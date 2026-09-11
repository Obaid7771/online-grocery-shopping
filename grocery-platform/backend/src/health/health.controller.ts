import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../common/prisma/prisma.service';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: { status: 'up' | 'down'; latency?: number };
    memory: { heapUsed: number; heapTotal: number; rss: number };
  };
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async check(): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();
    const uptime = process.uptime();
    const version = process.env.npm_package_version || '1.0.0';

    // Check database connection
    let dbStatus: 'up' | 'down' = 'down';
    let dbLatency: number | undefined;

    try {
      const startTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - startTime;
      dbStatus = 'up';
    } catch (error) {
      dbStatus = 'down';
    }

    // Get memory usage
    const memoryUsage = process.memoryUsage();

    const result: HealthCheckResult = {
      status: dbStatus === 'up' ? 'healthy' : 'unhealthy',
      timestamp,
      uptime,
      version,
      checks: {
        database: {
          status: dbStatus,
          latency: dbLatency,
        },
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
        },
      },
    };

    return result;
  }

  @Get('live')
  @Public()
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  live() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'error', message: 'Database not ready' };
    }
  }
}
