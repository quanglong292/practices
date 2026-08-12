import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DogModule } from './modules/dog/dog.module';
import { CacheModule } from '@nestjs/cache-manager';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './shared/prisma/prisma.module.js';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './core/exceptions/http-exception.filter';

@Module({
  imports: [
    CacheModule.register({
      // ttl: 60 * 1000 * 10,
      // Mock ttl 30s
      ttl: 30000,
      isGlobal: true,
    }),
    PrismaModule,
    DogModule,
    AnalyticsModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
