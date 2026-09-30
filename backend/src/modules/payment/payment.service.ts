import { Injectable, NotFoundException } from '@nestjs/common';
import { RazorpayService } from '../../infrastructure/providers/payment/razorpay.service.js';
import { RedisService } from '../../infrastructure/cache/redis.service.js';

@Injectable()
export class PaymentService {
  constructor(
    private readonly razorpay: RazorpayService,
    private readonly redis: RedisService,
  ) {}

  async initializePayment(bookingId: string) {
    // 1. Fetch booking from Postgres (or Redis temporary cache if DB not up yet)
    const pendingBooking = await this.redis.getCache<any>(`booking:${bookingId}`);
    
    if (!pendingBooking) {
      throw new NotFoundException('Pending booking not found or expired.');
    }

    // 2. Create Razorpay Order
    const order = await this.razorpay.createOrder(
      pendingBooking.totalPrice,
      pendingBooking.currency || 'INR',
      bookingId
    );

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingRef: pendingBooking.bookingRef,
    };
  }

  async handleWebhook(body: any, signature: string, rawBody: string) {
    const isValid = this.razorpay.verifyWebhookSignature(rawBody, signature);
    
    if (!isValid) {
      throw new Error('Invalid signature');
    }

    const event = body.event;
    if (event === 'payment.captured') {
      const paymentEntity = body.payload.payment.entity;
      // In production:
      // Update postgres Booking to CONFIRMED
      // Clear Redis seat lock
      console.log(`Payment captured for order ${paymentEntity.order_id}`);
    }

    return { received: true };
  }
}
