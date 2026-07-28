export const AIRPORTS = [
  { iata: "JFK", name: "John F. Kennedy International", city: "New York", country: "USA", lat: 40.6413, lng: -73.7781, currency: "USD", timezone: "America/New_York" },
  { iata: "LAX", name: "Los Angeles International", city: "Los Angeles", country: "USA", lat: 33.9425, lng: -118.408, currency: "USD", timezone: "America/Los_Angeles" },
  { iata: "ORD", name: "O'Hare International", city: "Chicago", country: "USA", lat: 41.9742, lng: -87.9073, currency: "USD", timezone: "America/Chicago" },
  { iata: "ATL", name: "Hartsfield–Jackson Atlanta International", city: "Atlanta", country: "USA", lat: 33.6407, lng: -84.4277, currency: "USD", timezone: "America/New_York" },
  { iata: "DFW", name: "Dallas/Fort Worth International", city: "Dallas", country: "USA", lat: 32.8998, lng: -97.0403, currency: "USD", timezone: "America/Chicago" },
  { iata: "DEN", name: "Denver International", city: "Denver", country: "USA", lat: 39.8561, lng: -104.6737, currency: "USD", timezone: "America/Denver" },
  { iata: "SFO", name: "San Francisco International", city: "San Francisco", country: "USA", lat: 37.6213, lng: -122.379, currency: "USD", timezone: "America/Los_Angeles" },
  { iata: "MIA", name: "Miami International", city: "Miami", country: "USA", lat: 25.7959, lng: -80.2870, currency: "USD", timezone: "America/New_York" },
  { iata: "SEA", name: "Seattle-Tacoma International", city: "Seattle", country: "USA", lat: 47.4502, lng: -122.3088, currency: "USD", timezone: "America/Los_Angeles" },
  { iata: "BOS", name: "Boston Logan International", city: "Boston", country: "USA", lat: 42.3656, lng: -71.0096, currency: "USD", timezone: "America/New_York" },
  { iata: "LHR", name: "Heathrow Airport", city: "London", country: "UK", lat: 51.4700, lng: -0.4543, currency: "GBP", timezone: "Europe/London" },
  { iata: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", lat: 49.0097, lng: 2.5479, currency: "EUR", timezone: "Europe/Paris" },
  { iata: "AMS", name: "Amsterdam Schiphol Airport", city: "Amsterdam", country: "Netherlands", lat: 52.3086, lng: 4.7639, currency: "EUR", timezone: "Europe/Amsterdam" },
  { iata: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", lat: 50.0379, lng: 8.5622, currency: "EUR", timezone: "Europe/Berlin" },
  { iata: "MAD", name: "Adolfo Suárez Madrid–Barajas Airport", city: "Madrid", country: "Spain", lat: 40.4719, lng: -3.5626, currency: "EUR", timezone: "Europe/Madrid" },
  { iata: "BCN", name: "Barcelona–El Prat Airport", city: "Barcelona", country: "Spain", lat: 41.2974, lng: 2.0833, currency: "EUR", timezone: "Europe/Madrid" },
  { iata: "FCO", name: "Leonardo da Vinci–Fiumicino Airport", city: "Rome", country: "Italy", lat: 41.8003, lng: 12.2389, currency: "EUR", timezone: "Europe/Rome" },
  { iata: "MUC", name: "Munich Airport", city: "Munich", country: "Germany", lat: 48.3538, lng: 11.7861, currency: "EUR", timezone: "Europe/Berlin" },
  { iata: "ZRH", name: "Zurich Airport", city: "Zurich", country: "Switzerland", lat: 47.4647, lng: 8.5492, currency: "CHF", timezone: "Europe/Zurich" },
  { iata: "VIE", name: "Vienna International Airport", city: "Vienna", country: "Austria", lat: 48.1103, lng: 16.5697, currency: "EUR", timezone: "Europe/Vienna" },
  { iata: "DXB", name: "Dubai International Airport", city: "Dubai", country: "UAE", lat: 25.2532, lng: 55.3657, currency: "AED", timezone: "Asia/Dubai" },
  { iata: "DOH", name: "Hamad International Airport", city: "Doha", country: "Qatar", lat: 25.2731, lng: 51.6082, currency: "QAR", timezone: "Asia/Qatar" },
  { iata: "AUH", name: "Abu Dhabi International Airport", city: "Abu Dhabi", country: "UAE", lat: 24.4330, lng: 54.6511, currency: "AED", timezone: "Asia/Dubai" },
  { iata: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", lat: 41.2753, lng: 28.7519, currency: "TRY", timezone: "Europe/Istanbul" },
  { iata: "TLV", name: "Ben Gurion Airport", city: "Tel Aviv", country: "Israel", lat: 32.0114, lng: 34.8867, currency: "ILS", timezone: "Asia/Jerusalem" },
  { iata: "BOM", name: "Chhatrapati Shivaji Maharaj International", city: "Mumbai", country: "India", lat: 19.0896, lng: 72.8656, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi", country: "India", lat: 28.5665, lng: 77.1031, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "BLR", name: "Kempegowda International Airport", city: "Bengaluru", country: "India", lat: 13.1986, lng: 77.7066, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "HND", name: "Tokyo Haneda Airport", city: "Tokyo", country: "Japan", lat: 35.5494, lng: 139.7798, currency: "JPY", timezone: "Asia/Tokyo" },
  { iata: "NRT", name: "Narita International Airport", city: "Tokyo", country: "Japan", lat: 35.7720, lng: 140.3929, currency: "JPY", timezone: "Asia/Tokyo" },
  { iata: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea", lat: 37.4691, lng: 126.4510, currency: "KRW", timezone: "Asia/Seoul" },
  { iata: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "China", lat: 40.0799, lng: 116.6031, currency: "CNY", timezone: "Asia/Shanghai" },
  { iata: "PVG", name: "Shanghai Pudong International Airport", city: "Shanghai", country: "China", lat: 31.1434, lng: 121.8052, currency: "CNY", timezone: "Asia/Shanghai" },
  { iata: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "China", lat: 22.3080, lng: 113.9185, currency: "HKD", timezone: "Asia/Hong_Kong" },
  { iata: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", lat: 1.3644, lng: 103.9915, currency: "SGD", timezone: "Asia/Singapore" },
  { iata: "KUL", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", country: "Malaysia", lat: 2.7456, lng: 101.7099, currency: "MYR", timezone: "Asia/Kuala_Lumpur" },
  { iata: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand", lat: 13.6900, lng: 100.7501, currency: "THB", timezone: "Asia/Bangkok" },
  { iata: "CGK", name: "Soekarno-Hatta International Airport", city: "Jakarta", country: "Indonesia", lat: -6.1275, lng: 106.6537, currency: "IDR", timezone: "Asia/Jakarta" },
  { iata: "SYD", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia", lat: -33.9461, lng: 151.1772, currency: "AUD", timezone: "Australia/Sydney" },
  { iata: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia", lat: -37.6733, lng: 144.8430, currency: "AUD", timezone: "Australia/Melbourne" },
  { iata: "AKL", name: "Auckland Airport", city: "Auckland", country: "New Zealand", lat: -37.0082, lng: 174.7917, currency: "NZD", timezone: "Pacific/Auckland" },
  { iata: "YYZ", name: "Toronto Pearson International Airport", city: "Toronto", country: "Canada", lat: 43.6777, lng: -79.6248, currency: "CAD", timezone: "America/Toronto" },
  { iata: "YVR", name: "Vancouver International Airport", city: "Vancouver", country: "Canada", lat: 49.1947, lng: -123.1792, currency: "CAD", timezone: "America/Vancouver" },
  { iata: "MEX", name: "Benito Juárez International Airport", city: "Mexico City", country: "Mexico", lat: 19.4363, lng: -99.0721, currency: "MXN", timezone: "America/Mexico_City" },
  { iata: "GRU", name: "São Paulo/Guarulhos International Airport", city: "São Paulo", country: "Brazil", lat: -23.4356, lng: -46.4731, currency: "BRL", timezone: "America/Sao_Paulo" },
  { iata: "BOG", name: "El Dorado International Airport", city: "Bogotá", country: "Colombia", lat: 4.7016, lng: -74.1469, currency: "COP", timezone: "America/Bogota" },
  { iata: "LIM", name: "Jorge Chávez International Airport", city: "Lima", country: "Peru", lat: -12.0219, lng: -77.1143, currency: "PEN", timezone: "America/Lima" },
  { iata: "JNB", name: "O. R. Tambo International Airport", city: "Johannesburg", country: "South Africa", lat: -26.1392, lng: 28.2460, currency: "ZAR", timezone: "Africa/Johannesburg" },
  { iata: "NBO", name: "Jomo Kenyatta International Airport", city: "Nairobi", country: "Kenya", lat: -1.3192, lng: 36.9275, currency: "KES", timezone: "Africa/Nairobi" },
  { iata: "CAI", name: "Cairo International Airport", city: "Cairo", country: "Egypt", lat: 30.1219, lng: 31.4056, currency: "EGP", timezone: "Africa/Cairo" },
];

export function searchAirports(query) {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  return AIRPORTS.filter(
    (a) =>
      a.iata.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q)
  ).slice(0, 8);
}
