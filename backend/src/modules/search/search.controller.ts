import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { SearchService } from './search.service.js';

@Controller('api/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('flights')
  async searchFlights(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('date') date: string,
    @Query('adults') adults: string,
    @Query('currency') currency: string,
  ) {
    if (!origin || !destination || !date) {
      throw new BadRequestException('Origin, destination, and date are required.');
    }

    const numAdults = adults ? parseInt(adults, 10) : 1;
    const curr = currency || 'INR';

    return this.searchService.searchFlights(
      origin.toUpperCase(),
      destination.toUpperCase(),
      date,
      numAdults,
      curr.toUpperCase()
    );
  }
}
