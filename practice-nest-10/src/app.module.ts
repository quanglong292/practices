import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DogModule } from './modules/dog/dog.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      // ttl: 60 * 1000 * 10,
      // Mock ttl 30s
      ttl: 30000,
      isGlobal: true,
    }),
    DogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
