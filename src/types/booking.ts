/**
 * TypeScript Interfaces for Amadeus, Duffel, and Aviationstack APIs.
 */

export interface AircraftTelemetry {
  hex: string;
  callsign: string;
  lat: number;
  lng: number;
  altitudeFeet: number;
  altitudeMeters: number;
  speedKmh: number;
  speedKnots: number;
  heading: number;
  squawk: string;
  airline: string;
  originIata: string;
  destinationIata: string;
  updatedAt: string;
}

export interface FlightSegment {
  id: string;
  departure: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string;
  airlineName: string;
  number: string;
  aircraft: string;
  durationMinutes: number;
}

export interface FlightItinerary {
  durationMinutes: number;
  segments: FlightSegment[];
}

export interface PriceDetail {
  currency: string;
  total: number;
  base: number;
  fees: number;
  cabinClass: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
}

export interface FlightOffer {
  id: string;
  source: "AMADEUS_GDS" | "DUFFEL_NDC" | "AVIATIONSTACK";
  instantTicketingRequired: boolean;
  validatingAirlineCode: string;
  validatingAirlineName: string;
  validatingAirlineLogo: string;
  price: PriceDetail;
  itineraries: FlightItinerary[];
  numberOfBookableSeats: number;
  deepLink: string;
}

export interface FlightSearchParams {
  originIata: string;
  destinationIata: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  travelClass: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
  nonStopOnly?: boolean;
}
