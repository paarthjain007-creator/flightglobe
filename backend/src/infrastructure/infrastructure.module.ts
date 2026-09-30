import { Module, Global } from '@nestjs/common';
import { RedisService } from './cache/redis.service.js';
import { DuffelService } from './providers/flight-api/duffel.service.js';
import { RazorpayService } from './providers/payment/razorpay.service.js';

@Global()
@Module({
  providers: [RedisService, DuffelService, RazorpayService],
  exports: [RedisService, DuffelService, RazorpayService],
})
export class InfrastructureModule {}
