import { Module, Global } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: config.get<number>('THROTTLE_SHORT_TTL', 1000), // 1 second
            limit: config.get<number>('THROTTLE_SHORT_LIMIT', 10), // 10 requests
          },
          {
            name: 'medium',
            ttl: config.get<number>('THROTTLE_MEDIUM_TTL', 10000), // 10 seconds
            limit: config.get<number>('THROTTLE_MEDIUM_LIMIT', 50), // 50 requests
          },
          {
            name: 'long',
            ttl: config.get<number>('THROTTLE_LONG_TTL', 60000), // 1 minute
            limit: config.get<number>('THROTTLE_LONG_LIMIT', 200), // 200 requests
          },
        ],
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [ThrottlerModule],
})
export class SecurityModule {}
