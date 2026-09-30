import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Duffel } from '@duffel/api';

@Injectable()
export class DuffelService {
  private duffel: Duffel;
  private readonly apiKey = process.env.DUFFEL_API_KEY || 'dummy_duffel_key';

  constructor() {
    this.duffel = new Duffel({
      token: this.apiKey,
    });
  }

  async searchFlights(originIata: string, destinationIata: string, departureDate: string, adults = 1, currency = 'INR') {
    try {
      if (this.apiKey === 'dummy_duffel_key') {
        return this.generateMockFlightOffers(originIata, destinationIata, departureDate, currency);
      }

      const passengers = Array(adults).fill({ type: 'adult' });

      // Create an Offer Request on Duffel
      const offerRequestResponse = await this.duffel.offerRequests.create({
        slices: [
          {
            origin: originIata,
            destination: destinationIata,
            departure_date: departureDate
          } as any
        ],
        passengers: passengers,
        cabin_class: 'economy',
        return_offers: true
      });

      const offers = offerRequestResponse.data.offers || [];

      // Map Duffel response to our frontend's expected normalized format
      return offers.map((offer: any) => {
        const slice = offer.slices[0];
        
        return {
          id: offer.id,
          itineraries: [
            {
              duration: slice.duration,
              segments: slice.segments.map((segment: any) => ({
                departure: { 
                  iataCode: segment.origin.iata_code, 
                  at: segment.departing_at 
                },
                arrival: { 
                  iataCode: segment.destination.iata_code, 
                  at: segment.arriving_at 
                },
                carrierCode: segment.marketing_carrier.iata_code,
                number: segment.marketing_carrier_flight_number,
              }))
            }
          ],
          price: {
            total: offer.total_amount,
            currency: offer.total_currency
          },
          airline: offer.owner.iata_code
        };
      });

    } catch (error: any) {
      console.error('Duffel API Error:', error.errors || error.message);
      throw new InternalServerErrorException('Failed to fetch flight offers from Duffel.');
    }
  }

  private generateMockFlightOffers(origin: string, dest: string, date: string, currency: string) {
    const airlines = ['AI', '6E', 'UK', 'QP'];
    const offers = [];
    
    for (let i = 1; i <= 5; i++) {
      const carrier = airlines[Math.floor(Math.random() * airlines.length)];
      const price = Math.floor(Math.random() * 8000) + 4000;
      
      offers.push({
        id: `MOCK-DUFFEL-${i}`,
        itineraries: [
          {
            duration: 'PT2H30M',
            segments: [
              {
                departure: { iataCode: origin, at: `${date}T10:00:00` },
                arrival: { iataCode: dest, at: `${date}T12:30:00` },
                carrierCode: carrier,
                number: `${Math.floor(Math.random() * 900) + 100}`,
              }
            ]
          }
        ],
        price: { total: price.toString(), currency },
        airline: carrier
      });
    }
    
    return offers;
  }
}
