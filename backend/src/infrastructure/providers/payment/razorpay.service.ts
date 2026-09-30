import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_dummy_secret',
    });
  }

  async createOrder(amount: number, currency: string, receipt: string) {
    try {
      if (process.env.RAZORPAY_KEY_ID === 'rzp_test_dummy_key') {
        // Return a mock order so UI testing doesn't break
        return {
          id: `order_mock_${Math.random().toString(36).substring(7)}`,
          amount: amount * 100,
          currency,
          receipt,
          status: 'created',
        };
      }

      const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise (smallest currency unit)
        currency,
        receipt,
        payment_capture: 1, // Auto-capture payment
      };

      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error('Razorpay Error:', error);
      throw new InternalServerErrorException('Failed to create payment order');
    }
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dummy_webhook_secret';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
      
    return expectedSignature === signature;
  }
}
