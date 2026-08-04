import { Inject, Injectable } from '@nestjs/common';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager_1 from 'cache-manager';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: cacheManager_1.Cache
  ) { }

  create(createAnalyticsDto: CreateAnalyticsDto) {
    return createAnalyticsDto.name;
  }

  findAll() {
    return `This action returns all analytics`;
  }

  async findOne(id: number) {
    const onCache = await this.cacheManager.get(`analytics:${id}`)

    if (onCache) {
      return `This action returns a #${onCache} analytics from cache`
    }

    // Fake heavy computation with 15s
    await new Promise((resolve) => setTimeout(resolve, 15000));
    // Fake cache value to caching manager
    await this.cacheManager.set(`analytics:${id}`, 'cached value');
    return `This action returns a #${id} analytics`;
  }

  update(id: number, updateAnalyticsDto: UpdateAnalyticsDto) {
    return `This action updates a #${id} analytics`;
  }

  remove(id: number) {
    return `This action removes a #${id} analytics`;
  }
}
