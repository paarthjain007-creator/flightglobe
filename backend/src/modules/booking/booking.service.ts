import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { RedisService } from '../../infrastructure/cache/redis.service.js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BookingService {
  constructor(private readonly redis: RedisService) {}

  async holdSeat(flightId: string, seat: string, userId: string) {
    const lockKey = `seat-lock:${flightId}:${seat}`;
    
    // Check if seat is already held or booked
    const existingLock = await this.redis.getCache<{ userId: string }>(lockKey);
    if (existingLock) {
      if (existingLock.userId === userId) {
        return { message: 'You already hold this seat', status: 'held' };
      }
      throw new BadRequestException('Seat is currently held by another user or already booked.');
    }

    // Lock seat for 10 minutes (600 seconds)
    await this.redis.setCache(lockKey, { userId, lockedAt: new Date().toISOString() }, 600);
    
    return {
      message: 'Seat held successfully for 10 minutes',
      flightId,
      seat,
      expiresIn: 600,
    };
  }

  async createBooking(bookingData: any) {
    // In a full flow:
    // 1. Verify seat lock belongs to this user.
    // 2. Validate price via Amadeus pricing API.
    // 3. Create Pending Booking in Postgres.
    // 4. Return Pending Booking ID for Payment Gateway (Razorpay).
    
    const { flightId, seat, userId, flightDetails } = bookingData;
    const lockKey = `seat-lock:${flightId}:${seat}`;
    const lock = await this.redis.getCache<{ userId: string }>(lockKey);
    
    if (!lock || lock.userId !== userId) {
      throw new BadRequestException('Seat hold expired or belongs to another user. Please re-select the seat.');
    }

    const bookingRef = `FG-${Math.floor(100000 + Math.random() * 900000)}`;
    const pendingBooking = {
      id: uuidv4(),
      bookingRef,
      userId,
      flightDetails,
      seat,
      status: 'PENDING',
      totalPrice: flightDetails.price || 42500,
    };

    // Temporarily storing in Redis until Postgres is fully online via Docker
    await this.redis.setCache(`booking:${pendingBooking.id}`, pendingBooking, 86400);

    return pendingBooking;
  }
}
