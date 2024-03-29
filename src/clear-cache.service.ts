import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class ClearCacheService implements OnApplicationShutdown {
  constructor(@Inject(CACHE_MANAGER) private cacheService: Cache) {}

  onApplicationShutdown() {
    // clear cache when change DB design
    // this.cacheService.reset();
    // console.log('Clear cache successfully.');
  }
}
