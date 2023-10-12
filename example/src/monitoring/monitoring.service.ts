import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheModule, Injectable, Inject } from '@nestjs/common';
import { Counter } from 'prom-client';

@Injectable()
export class MonitoringService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async initializeAsync() {
    console.log(
      'Initializing counter on start ',
      (await this.cache.get('requestCount')) || '0',
    );
    await this.requestCounter.inc(
      parseInt((await this.cache.get('requestCount')) || '0'),
    );
  }

  private requestCounter: Counter<string> = new Counter({
    name: 'request_count',
    help: 'total request count',
  });

  public async getRequestCounter() {
    return this.cache.get('requestCount') || 0;
  }

  public async incrementRequestCounter(): Promise<void> {
    this.requestCounter.inc();
    console.log(
      'Cache set',
      (await this.requestCounter.get()).values[0].value + 1,
    );
    await this.cache.set(
      'requestCount',
      (await this.requestCounter.get()).values[0].value + 1,
    );
  }

  public async onExit(): Promise<void> {
    console.log(
      'On exit called, exiting and saving the value with ',
      (await this.requestCounter.get()).values[0].value + 1,
    );
    try {
      await this.cache.set(
        'requestCount',
        (await this.requestCounter.get()).values[0].value + 1,
      );
    } catch (err) {
      console.log(err);
    }
  }
}
