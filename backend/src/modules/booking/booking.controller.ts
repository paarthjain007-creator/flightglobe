import { Controller, Post, Body } from '@nestjs/common';
import { BookingService } from './booking.service.js';

@Controller('api/bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('hold')
  async holdSeat(
    @Body('flightId') flightId: string,
    @Body('seat') seat: string,
    @Body('userId') userId: string,
  ) {
    // In production, userId comes from JWT auth guard
    const uId = userId || 'usr_commander_1';
    return this.bookingService.holdSeat(flightId, seat, uId);
  }

  @Post()
  async createBooking(@Body() body: any) {
    const uId = body.userId || 'usr_commander_1';
    return this.bookingService.createBooking({ ...body, userId: uId });
  }
}
