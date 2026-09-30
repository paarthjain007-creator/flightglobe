import { Injectable } from '@nestjs/common';
import { DuffelService } from '../../infrastructure/providers/flight-api/duffel.service.js';
import { RedisService } from '../../infrastructure/cache/redis.service.js';
import * as crypto from 'crypto';

@Injectable()
export class SearchService {
  constructor(
    private readonly flightApi: DuffelService,
    private readonly redis: RedisService,
  ) {}

  async searchFlights(origin: string, dest: string, date: string, adults = 1, currency = 'INR') {
    // 1. Generate Cache Key based on search params
    const cacheKey = `search:${origin}:${dest}:${date}:${adults}:${currency}`;

    // 2. Check Redis for 15-minute cached result
    const cachedResult = await this.redis.getCache(cacheKey);
    if (cachedResult) {
      return { source: 'cache', data: cachedResult };
    }

    // 3. Fetch from Real Flight API
    const flightOffers = await this.flightApi.searchFlights(origin, dest, date, adults, currency);

    // 4. Cache the result for 15 minutes (900 seconds)
    await this.redis.setCache(cacheKey, flightOffers, 900);

    return { source: 'api', data: flightOffers };
  }
}
