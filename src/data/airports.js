/**
 * Global Airports Dataset — Commercial & Regional Airports across Earth
 * Covers North America, South America, Europe, Asia, Middle East, Africa, Oceania & Antarctica.
 */

const RAW_AIRPORTS = [
  // NORTH AMERICA — USA
  { iata: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States", lat: 40.6413, lng: -73.7781, currency: "USD", timezone: "America/New_York" },
  { iata: "EWR", name: "Newark Liberty International Airport", city: "Newark / New York", country: "United States", lat: 40.6895, lng: -74.1745, currency: "USD", timezone: "America/New_York" },
  { iata: "LGA", name: "LaGuardia Airport", city: "New York", country: "United States", lat: 40.7769, lng: -73.8740, currency: "USD", timezone: "America/New_York" },
  { iata: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States", lat: 33.9425, lng: -118.4081, currency: "USD", timezone: "America/Los_Angeles" },
  { iata: "ORD", name: "O'Hare International Airport", city: "Chicago", country: "United States", lat: 41.9742, lng: -87.9073, currency: "USD", timezone: "America/Chicago" },
  { iata: "MDW", name: "Chicago Midway International Airport", city: "Chicago", country: "United States", lat: 41.7868, lng: -87.7522, currency: "USD", timezone: "America/Chicago" },
  { iata: "ATL", name: "Hartsfield–Jackson Atlanta International Airport", city: "Atlanta", country: "United States", lat: 33.6407, lng: -84.4277, currency: "USD", timezone: "America/New_York" },
  { iata: "DFW", name: "Dallas/Fort Worth International Airport", city: "Dallas", country: "United States", lat: 32.8998, lng: -97.0403, currency: "USD", timezone: "America/Chicago" },
  { iata: "DEN", name: "Denver International Airport", city: "Denver", country: "United States", lat: 39.8561, lng: -104.6737, currency: "USD", timezone: "America/Denver" },
  { iata: "SFO", name: "San Francisco International Airport", city: "San Francisco", country: "United States", lat: 37.6213, lng: -122.3790, currency: "USD", timezone: "America/Los_Angeles" },
  { iata: "MIA", name: "Miami International Airport", city: "Miami", country: "United States", lat: 25.7959, lng: -80.2870, currency: "USD", timezone: "America/New_York" },
  { iata: "SEA", name: "Seattle-Tacoma International Airport", city: "Seattle", country: "United States", lat: 47.4502, lng: -122.3088, currency: "USD", timezone: "America/Los_Angeles" },
  { iata: "BOS", name: "Boston Logan International Airport", city: "Boston", country: "United States", lat: 42.3656, lng: -71.0096, currency: "USD", timezone: "America/New_York" },
  { iata: "IAD", name: "Washington Dulles International Airport", city: "Washington D.C.", country: "United States", lat: 38.9531, lng: -77.4565, currency: "USD", timezone: "America/New_York" },
  { iata: "DCA", name: "Ronald Reagan Washington National Airport", city: "Washington D.C.", country: "United States", lat: 38.8512, lng: -77.0402, currency: "USD", timezone: "America/New_York" },
  { iata: "IAH", name: "George Bush Intercontinental Airport", city: "Houston", country: "United States", lat: 29.9902, lng: -95.3368, currency: "USD", timezone: "America/Chicago" },
  { iata: "PHX", name: "Phoenix Sky Harbor International Airport", city: "Phoenix", country: "United States", lat: 33.4352, lng: -112.0101, currency: "USD", timezone: "America/Phoenix" },
  { iata: "LAS", name: "Harry Reid International Airport", city: "Las Vegas", country: "United States", lat: 36.0840, lng: -115.1537, currency: "USD", timezone: "America/Los_Angeles" },
  { iata: "MCO", name: "Orlando International Airport", city: "Orlando", country: "United States", lat: 28.4312, lng: -81.3081, currency: "USD", timezone: "America/New_York" },
  { iata: "MSP", name: "Minneapolis–Saint Paul International Airport", city: "Minneapolis", country: "United States", lat: 44.8848, lng: -93.2223, currency: "USD", timezone: "America/Chicago" },
  { iata: "DTW", name: "Detroit Metropolitan Airport", city: "Detroit", country: "United States", lat: 42.2162, lng: -83.3554, currency: "USD", timezone: "America/Detroit" },
  { iata: "PHL", name: "Philadelphia International Airport", city: "Philadelphia", country: "United States", lat: 39.8729, lng: -75.2437, currency: "USD", timezone: "America/New_York" },
  { iata: "SAN", name: "San Diego International Airport", city: "San Diego", country: "United States", lat: 32.7338, lng: -117.1933, currency: "USD", timezone: "America/Los_Angeles" },
  { iata: "SLC", name: "Salt Lake City International Airport", city: "Salt Lake City", country: "United States", lat: 40.7899, lng: -111.9791, currency: "USD", timezone: "America/Denver" },
  { iata: "PDX", name: "Portland International Airport", city: "Portland", country: "United States", lat: 45.5898, lng: -122.5951, currency: "USD", timezone: "America/Los_Angeles" },
  { iata: "ANC", name: "Ted Stevens Anchorage International Airport", city: "Anchorage", country: "United States", lat: 61.1744, lng: -149.9963, currency: "USD", timezone: "America/Anchorage" },
  { iata: "HNL", name: "Daniel K. Inouye International Airport", city: "Honolulu", country: "United States", lat: 21.3187, lng: -157.9225, currency: "USD", timezone: "Pacific/Honolulu" },

  // NORTH AMERICA — CANADA & MEXICO & CARIBBEAN
  { iata: "YYZ", name: "Toronto Pearson International Airport", city: "Toronto", country: "Canada", lat: 43.6777, lng: -79.6248, currency: "CAD", timezone: "America/Toronto" },
  { iata: "YVR", name: "Vancouver International Airport", city: "Vancouver", country: "Canada", lat: 49.1947, lng: -123.1792, currency: "CAD", timezone: "America/Vancouver" },
  { iata: "YUL", name: "Montréal-Trudeau International Airport", city: "Montreal", country: "Canada", lat: 45.4657, lng: -73.7455, currency: "CAD", timezone: "America/Toronto" },
  { iata: "YYC", name: "Calgary International Airport", city: "Calgary", country: "Canada", lat: 51.1215, lng: -114.0076, currency: "CAD", timezone: "America/Edmonton" },
  { iata: "MEX", name: "Benito Juárez International Airport", city: "Mexico City", country: "Mexico", lat: 19.4363, lng: -99.0721, currency: "MXN", timezone: "America/Mexico_City" },
  { iata: "CUN", name: "Cancún International Airport", city: "Cancun", country: "Mexico", lat: 21.0365, lng: -86.8771, currency: "MXN", timezone: "America/Cancun" },
  { iata: "GDL", name: "Guadalajara International Airport", city: "Guadalajara", country: "Mexico", lat: 20.5218, lng: -103.3112, currency: "MXN", timezone: "America/Mexico_City" },
  { iata: "SJU", name: "Luis Muñoz Marín International Airport", city: "San Juan", country: "Puerto Rico", lat: 18.4394, lng: -66.0018, currency: "USD", timezone: "America/Puerto_Rico" },
  { iata: "PUJ", name: "Punta Cana International Airport", city: "Punta Cana", country: "Dominican Republic", lat: 18.5674, lng: -68.3634, currency: "DOP", timezone: "America/Santo_Domingo" },
  { iata: "HAV", name: "José Martí International Airport", city: "Havana", country: "Cuba", lat: 22.9892, lng: -82.4091, currency: "CUP", timezone: "America/Havana" },

  // EUROPE — UK & IRELAND
  { iata: "LHR", name: "Heathrow Airport", city: "London", country: "United Kingdom", lat: 51.4700, lng: -0.4543, currency: "GBP", timezone: "Europe/London" },
  { iata: "LGW", name: "Gatwick Airport", city: "London", country: "United Kingdom", lat: 51.1537, lng: -0.1821, currency: "GBP", timezone: "Europe/London" },
  { iata: "STN", name: "London Stansted Airport", city: "London", country: "United Kingdom", lat: 51.8860, lng: 0.2389, currency: "GBP", timezone: "Europe/London" },
  { iata: "MAN", name: "Manchester Airport", city: "Manchester", country: "United Kingdom", lat: 53.3537, lng: -2.2750, currency: "GBP", timezone: "Europe/London" },
  { iata: "EDI", name: "Edinburgh Airport", city: "Edinburgh", country: "United Kingdom", lat: 55.9500, lng: -3.3725, currency: "GBP", timezone: "Europe/London" },
  { iata: "DUB", name: "Dublin Airport", city: "Dublin", country: "Ireland", lat: 53.4264, lng: -6.2499, currency: "EUR", timezone: "Europe/Dublin" },

  // EUROPE — WESTERN & CENTRAL
  { iata: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", lat: 49.0097, lng: 2.5479, currency: "EUR", timezone: "Europe/Paris" },
  { iata: "ORY", name: "Paris Orly Airport", city: "Paris", country: "France", lat: 48.7262, lng: 2.3652, currency: "EUR", timezone: "Europe/Paris" },
  { iata: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands", lat: 52.3086, lng: 4.7639, currency: "EUR", timezone: "Europe/Amsterdam" },
  { iata: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", lat: 50.0379, lng: 8.5622, currency: "EUR", timezone: "Europe/Berlin" },
  { iata: "MUC", name: "Munich Airport", city: "Munich", country: "Germany", lat: 48.3538, lng: 11.7861, currency: "EUR", timezone: "Europe/Berlin" },
  { iata: "BER", name: "Berlin Brandenburg Airport", city: "Berlin", country: "Germany", lat: 52.3667, lng: 13.5033, currency: "EUR", timezone: "Europe/Berlin" },
  { iata: "ZRH", name: "Zurich Airport", city: "Zurich", country: "Switzerland", lat: 47.4647, lng: 8.5492, currency: "CHF", timezone: "Europe/Zurich" },
  { iata: "GVA", name: "Geneva Airport", city: "Geneva", country: "Switzerland", lat: 46.2370, lng: 6.1092, currency: "CHF", timezone: "Europe/Zurich" },
  { iata: "VIE", name: "Vienna International Airport", city: "Vienna", country: "Austria", lat: 48.1103, lng: 16.5697, currency: "EUR", timezone: "Europe/Vienna" },
  { iata: "BRU", name: "Brussels Airport", city: "Brussels", country: "Belgium", lat: 50.9010, lng: 4.4856, currency: "EUR", timezone: "Europe/Brussels" },

  // EUROPE — SOUTHERN & EASTERN & NORDIC
  { iata: "MAD", name: "Adolfo Suárez Madrid–Barajas Airport", city: "Madrid", country: "Spain", lat: 40.4719, lng: -3.5626, currency: "EUR", timezone: "Europe/Madrid" },
  { iata: "BCN", name: "Josep Tarradellas Barcelona–El Prat Airport", city: "Barcelona", country: "Spain", lat: 41.2974, lng: 2.0833, currency: "EUR", timezone: "Europe/Madrid" },
  { iata: "FCO", name: "Rome Fiumicino Airport", city: "Rome", country: "Italy", lat: 41.8003, lng: 12.2389, currency: "EUR", timezone: "Europe/Rome" },
  { iata: "MXP", name: "Milan Malpensa Airport", city: "Milan", country: "Italy", lat: 45.6301, lng: 8.7255, currency: "EUR", timezone: "Europe/Rome" },
  { iata: "LIS", name: "Humberto Delgado Airport", city: "Lisbon", country: "Portugal", lat: 38.7756, lng: -9.1354, currency: "EUR", timezone: "Europe/Lisbon" },
  { iata: "ATH", name: "Athens International Airport", city: "Athens", country: "Greece", lat: 37.9364, lng: 23.9472, currency: "EUR", timezone: "Europe/Athens" },
  { iata: "CPH", name: "Copenhagen Airport", city: "Copenhagen", country: "Denmark", lat: 55.6180, lng: 12.6508, currency: "DKK", timezone: "Europe/Copenhagen" },
  { iata: "ARN", name: "Stockholm Arlanda Airport", city: "Stockholm", country: "Sweden", lat: 59.6498, lng: 17.9238, currency: "SEK", timezone: "Europe/Stockholm" },
  { iata: "OSL", name: "Oslo Airport, Gardermoen", city: "Oslo", country: "Norway", lat: 60.1976, lng: 11.1004, currency: "NOK", timezone: "Europe/Oslo" },
  { iata: "HEL", name: "Helsinki Airport", city: "Helsinki", country: "Finland", lat: 60.3172, lng: 24.9633, currency: "EUR", timezone: "Europe/Helsinki" },
  { iata: "WAW", name: "Warsaw Chopin Airport", city: "Warsaw", country: "Poland", lat: 52.1672, lng: 20.9679, currency: "PLN", timezone: "Europe/Warsaw" },
  { iata: "PRG", name: "Václav Havel Airport Prague", city: "Prague", country: "Czechia", lat: 50.1008, lng: 14.2600, currency: "CZK", timezone: "Europe/Prague" },
  { iata: "BUD", name: "Budapest Ferenc Liszt International Airport", city: "Budapest", country: "Hungary", lat: 47.4369, lng: 19.2556, currency: "HUF", timezone: "Europe/Budapest" },
  { iata: "SVO", name: "Sheremetyevo International Airport", city: "Moscow", country: "Russia", lat: 55.9726, lng: 37.4146, currency: "RUB", timezone: "Europe/Moscow" },

  // MIDDLE EAST & TURKEY
  { iata: "DXB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates", lat: 25.2532, lng: 55.3657, currency: "AED", timezone: "Asia/Dubai" },
  { iata: "DWC", name: "Al Maktoum International Airport", city: "Dubai", country: "United Arab Emirates", lat: 24.8961, lng: 55.1614, currency: "AED", timezone: "Asia/Dubai" },
  { iata: "AUH", name: "Zayed International Airport", city: "Abu Dhabi", country: "United Arab Emirates", lat: 24.4330, lng: 54.6511, currency: "AED", timezone: "Asia/Dubai" },
  { iata: "SHJ", name: "Sharjah International Airport", city: "Sharjah", country: "United Arab Emirates", lat: 25.3286, lng: 55.5172, currency: "AED", timezone: "Asia/Dubai" },
  { iata: "DOH", name: "Hamad International Airport", city: "Doha", country: "Qatar", lat: 25.2731, lng: 51.6082, currency: "QAR", timezone: "Asia/Qatar" },
  { iata: "RUH", name: "King Khalid International Airport", city: "Riyadh", country: "Saudi Arabia", lat: 24.9576, lng: 46.6988, currency: "SAR", timezone: "Asia/Riyadh" },
  { iata: "JED", name: "King Abdulaziz International Airport", city: "Jeddah", country: "Saudi Arabia", lat: 21.6796, lng: 39.1565, currency: "SAR", timezone: "Asia/Riyadh" },
  { iata: "MCT", name: "Muscat International Airport", city: "Muscat", country: "Oman", lat: 23.5933, lng: 58.2844, currency: "OMR", timezone: "Asia/Muscat" },
  { iata: "KWI", name: "Kuwait International Airport", city: "Kuwait City", country: "Kuwait", lat: 29.2261, lng: 47.9689, currency: "KWD", timezone: "Asia/Kuwait" },
  { iata: "BAH", name: "Bahrain International Airport", city: "Manama", country: "Bahrain", lat: 26.2708, lng: 50.6336, currency: "BHD", timezone: "Asia/Bahrain" },
  { iata: "AMM", name: "Queen Alia International Airport", city: "Amman", country: "Jordan", lat: 31.7225, lng: 35.9932, currency: "JOD", timezone: "Asia/Amman" },
  { iata: "BEY", name: "Beirut–Rafic Hariri International Airport", city: "Beirut", country: "Lebanon", lat: 33.8209, lng: 35.4884, currency: "USD", timezone: "Asia/Beirut" },
  { iata: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", lat: 41.2753, lng: 28.7519, currency: "TRY", timezone: "Europe/Istanbul" },
  { iata: "SAW", name: "Sabiha Gökçen International Airport", city: "Istanbul", country: "Turkey", lat: 40.8986, lng: 29.3092, currency: "TRY", timezone: "Europe/Istanbul" },
  { iata: "AYT", name: "Antalya Airport", city: "Antalya", country: "Turkey", lat: 36.8987, lng: 30.8005, currency: "TRY", timezone: "Europe/Istanbul" },
  { iata: "TLV", name: "Ben Gurion Airport", city: "Tel Aviv", country: "Israel", lat: 32.0114, lng: 34.8867, currency: "ILS", timezone: "Asia/Jerusalem" },

  // SOUTH ASIA — INDIA, PAKISTAN, SRI LANKA, NEPAL, BANGLADESH
  { iata: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi", country: "India", lat: 28.5665, lng: 77.1031, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India", lat: 19.0896, lng: 72.8656, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "BLR", name: "Kempegowda International Airport", city: "Bengaluru", country: "India", lat: 13.1986, lng: 77.7066, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "MAA", name: "Chennai International Airport", city: "Chennai", country: "India", lat: 12.9941, lng: 80.1709, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "HYD", name: "Rajiv Gandhi International Airport", city: "Hyderabad", country: "India", lat: 17.2403, lng: 78.4294, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "CCU", name: "Netaji Subhash Chandra Bose International Airport", city: "Kolkata", country: "India", lat: 22.6547, lng: 88.4467, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "COK", name: "Cochin International Airport", city: "Kochi", country: "India", lat: 10.1520, lng: 76.4019, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "AMD", name: "Sardar Vallabhbhai Patel International Airport", city: "Ahmedabad", country: "India", lat: 23.0772, lng: 72.6347, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "GOI", name: "Goa Dabolim Airport", city: "Goa", country: "India", lat: 15.3808, lng: 73.8314, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "ISB", name: "Islamabad International Airport", city: "Islamabad", country: "Pakistan", lat: 33.5492, lng: 72.8258, currency: "PKR", timezone: "Asia/Karachi" },
  { iata: "KHI", name: "Jinnah International Airport", city: "Karachi", country: "Pakistan", lat: 24.9065, lng: 67.1608, currency: "PKR", timezone: "Asia/Karachi" },
  { iata: "LHE", name: "Allama Iqbal International Airport", city: "Lahore", country: "Pakistan", lat: 31.5216, lng: 74.4036, currency: "PKR", timezone: "Asia/Karachi" },
  { iata: "CMB", name: "Bandaranaike International Airport", city: "Colombo", country: "Sri Lanka", lat: 7.1808, lng: 79.8841, currency: "LKR", timezone: "Asia/Colombo" },
  { iata: "KTM", name: "Tribhuvan International Airport", city: "Kathmandu", country: "Nepal", lat: 27.6966, lng: 85.3591, currency: "NPR", timezone: "Asia/Kathmandu" },
  { iata: "DAC", name: "Hazrat Shahjalal International Airport", city: "Dhaka", country: "Bangladesh", lat: 23.8433, lng: 90.3978, currency: "BDT", timezone: "Asia/Dhaka" },
  { iata: "MLE", name: "Velana International Airport", city: "Malé", country: "Maldives", lat: 4.1918, lng: 73.5291, currency: "USD", timezone: "Indian/Maldives" },

  // EAST ASIA — JAPAN, CHINA, SOUTH KOREA, TAIWAN
  { iata: "HND", name: "Tokyo Haneda Airport", city: "Tokyo", country: "Japan", lat: 35.5494, lng: 139.7798, currency: "JPY", timezone: "Asia/Tokyo" },
  { iata: "NRT", name: "Narita International Airport", city: "Tokyo", country: "Japan", lat: 35.7720, lng: 140.3929, currency: "JPY", timezone: "Asia/Tokyo" },
  { iata: "KIX", name: "Kansai International Airport", city: "Osaka", country: "Japan", lat: 34.4347, lng: 135.2442, currency: "JPY", timezone: "Asia/Tokyo" },
  { iata: "NGO", name: "Chubu Centrair International Airport", city: "Nagoya", country: "Japan", lat: 34.8583, lng: 136.8053, currency: "JPY", timezone: "Asia/Tokyo" },
  { iata: "FUK", name: "Fukuoka Airport", city: "Fukuoka", country: "Japan", lat: 33.5859, lng: 130.4507, currency: "JPY", timezone: "Asia/Tokyo" },
  { iata: "CTS", name: "New Chitose Airport", city: "Sapporo", country: "Japan", lat: 42.7752, lng: 141.6923, currency: "JPY", timezone: "Asia/Tokyo" },
  { iata: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea", lat: 37.4691, lng: 126.4510, currency: "KRW", timezone: "Asia/Seoul" },
  { iata: "GMP", name: "Gimpo International Airport", city: "Seoul", country: "South Korea", lat: 37.5583, lng: 126.7906, currency: "KRW", timezone: "Asia/Seoul" },
  { iata: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "China", lat: 40.0799, lng: 116.6031, currency: "CNY", timezone: "Asia/Shanghai" },
  { iata: "PKX", name: "Beijing Daxing International Airport", city: "Beijing", country: "China", lat: 39.5098, lng: 116.4105, currency: "CNY", timezone: "Asia/Shanghai" },
  { iata: "PVG", name: "Shanghai Pudong International Airport", city: "Shanghai", country: "China", lat: 31.1434, lng: 121.8052, currency: "CNY", timezone: "Asia/Shanghai" },
  { iata: "SHA", name: "Shanghai Hongqiao International Airport", city: "Shanghai", country: "China", lat: 31.1979, lng: 121.3363, currency: "CNY", timezone: "Asia/Shanghai" },
  { iata: "CAN", name: "Guangzhou Baiyun International Airport", city: "Guangzhou", country: "China", lat: 23.3924, lng: 113.2988, currency: "CNY", timezone: "Asia/Shanghai" },
  { iata: "SZX", name: "Shenzhen Bao'an International Airport", city: "Shenzhen", country: "China", lat: 22.6393, lng: 113.8107, currency: "CNY", timezone: "Asia/Shanghai" },
  { iata: "CTU", name: "Chengdu Shuangliu International Airport", city: "Chengdu", country: "China", lat: 30.5785, lng: 103.9471, currency: "CNY", timezone: "Asia/Shanghai" },
  { iata: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "Hong Kong SAR", lat: 22.3080, lng: 113.9185, currency: "HKD", timezone: "Asia/Hong_Kong" },
  { iata: "TPE", name: "Taiwan Taoyuan International Airport", city: "Taipei", country: "Taiwan", lat: 25.0777, lng: 121.2328, currency: "TWD", timezone: "Asia/Taipei" },

  // SOUTHEAST ASIA
  { iata: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", lat: 1.3644, lng: 103.9915, currency: "SGD", timezone: "Asia/Singapore" },
  { iata: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand", lat: 13.6900, lng: 100.7501, currency: "THB", timezone: "Asia/Bangkok" },
  { iata: "DMK", name: "Don Mueang International Airport", city: "Bangkok", country: "Thailand", lat: 13.9126, lng: 100.6068, currency: "THB", timezone: "Asia/Bangkok" },
  { iata: "HKT", name: "Phuket International Airport", city: "Phuket", country: "Thailand", lat: 8.1132, lng: 98.3169, currency: "THB", timezone: "Asia/Bangkok" },
  { iata: "KUL", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", country: "Malaysia", lat: 2.7456, lng: 101.7099, currency: "MYR", timezone: "Asia/Kuala_Lumpur" },
  { iata: "CGK", name: "Soekarno-Hatta International Airport", city: "Jakarta", country: "Indonesia", lat: -6.1275, lng: 106.6537, currency: "IDR", timezone: "Asia/Jakarta" },
  { iata: "DPS", name: "I Gusti Ngurah Rai International Airport", city: "Bali", country: "Indonesia", lat: -8.7482, lng: 115.1672, currency: "IDR", timezone: "Asia/Makassar" },
  { iata: "MNL", name: "Ninoy Aquino International Airport", city: "Manila", country: "Philippines", lat: 14.5086, lng: 121.0194, currency: "PHP", timezone: "Asia/Manila" },
  { iata: "CEB", name: "Mactan–Cebu International Airport", city: "Cebu", country: "Philippines", lat: 10.3075, lng: 123.9794, currency: "PHP", timezone: "Asia/Manila" },
  { iata: "SGN", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City", country: "Vietnam", lat: 10.8188, lng: 106.6519, currency: "VND", timezone: "Asia/Ho_Chi_Minh" },
  { iata: "HAN", name: "Noi Bai International Airport", city: "Hanoi", country: "Vietnam", lat: 21.2212, lng: 105.8072, currency: "VND", timezone: "Asia/Bangkok" },
  { iata: "RGN", name: "Yangon International Airport", city: "Yangon", country: "Myanmar", lat: 16.9073, lng: 96.1332, currency: "MMK", timezone: "Asia/Yangon" },
  { iata: "PNH", name: "Phnom Penh International Airport", city: "Phnom Penh", country: "Cambodia", lat: 11.5466, lng: 104.8441, currency: "USD", timezone: "Asia/Phnom_Penh" },

  // OCEANIA — AUSTRALIA, NEW ZEALAND, PACIFIC ISLANDS
  { iata: "SYD", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia", lat: -33.9461, lng: 151.1772, currency: "AUD", timezone: "Australia/Sydney" },
  { iata: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia", lat: -37.6733, lng: 144.8430, currency: "AUD", timezone: "Australia/Melbourne" },
  { iata: "BNE", name: "Brisbane Airport", city: "Brisbane", country: "Australia", lat: -27.3842, lng: 153.1175, currency: "AUD", timezone: "Australia/Brisbane" },
  { iata: "PER", name: "Perth Airport", city: "Perth", country: "Australia", lat: -31.9403, lng: 115.9669, currency: "AUD", timezone: "Australia/Perth" },
  { iata: "ADL", name: "Adelaide Airport", city: "Adelaide", country: "Australia", lat: -34.9450, lng: 138.5306, currency: "AUD", timezone: "Australia/Adelaide" },
  { iata: "CNS", name: "Cairns Airport", city: "Cairns", country: "Australia", lat: -16.8858, lng: 145.7553, currency: "AUD", timezone: "Australia/Brisbane" },
  { iata: "AKL", name: "Auckland Airport", city: "Auckland", country: "New Zealand", lat: -37.0082, lng: 174.7917, currency: "NZD", timezone: "Pacific/Auckland" },
  { iata: "CHC", name: "Christchurch International Airport", city: "Christchurch", country: "New Zealand", lat: -43.4894, lng: 172.5322, currency: "NZD", timezone: "Pacific/Auckland" },
  { iata: "WLG", name: "Wellington International Airport", city: "Wellington", country: "New Zealand", lat: -41.3272, lng: 174.8053, currency: "NZD", timezone: "Pacific/Auckland" },
  { iata: "NAN", name: "Nadi International Airport", city: "Nadi", country: "Fiji", lat: -17.7554, lng: 177.4432, currency: "FJD", timezone: "Pacific/Fiji" },
  { iata: "PPT", name: "Fa'a'ā International Airport", city: "Papeete", country: "French Polynesia", lat: -17.5537, lng: -149.6072, currency: "XPF", timezone: "Pacific/Tahiti" },

  // SOUTH AMERICA & CENTRAL AMERICA
  { iata: "GRU", name: "São Paulo/Guarulhos International Airport", city: "São Paulo", country: "Brazil", lat: -23.4356, lng: -46.4731, currency: "BRL", timezone: "America/Sao_Paulo" },
  { iata: "GIG", name: "Rio de Janeiro/Galeão International Airport", city: "Rio de Janeiro", country: "Brazil", lat: -22.8099, lng: -43.2505, currency: "BRL", timezone: "America/Sao_Paulo" },
  { iata: "BSB", name: "Brasília International Airport", city: "Brasília", country: "Brazil", lat: -15.8697, lng: -47.9172, currency: "BRL", timezone: "America/Sao_Paulo" },
  { iata: "EZE", name: "Ministro Pistarini International Airport (Ezeiza)", city: "Buenos Aires", country: "Argentina", lat: -34.8222, lng: -58.5358, currency: "ARS", timezone: "America/Argentina/Buenos_Aires" },
  { iata: "SCL", name: "Arturo Merino Benítez International Airport", city: "Santiago", country: "Chile", lat: -33.3930, lng: -70.7858, currency: "CLP", timezone: "America/Santiago" },
  { iata: "BOG", name: "El Dorado International Airport", city: "Bogotá", country: "Colombia", lat: 4.7016, lng: -74.1469, currency: "COP", timezone: "America/Bogota" },
  { iata: "LIM", name: "Jorge Chávez International Airport", city: "Lima", country: "Peru", lat: -12.0219, lng: -77.1143, currency: "PEN", timezone: "America/Lima" },
  { iata: "PTY", name: "Tocumen International Airport", city: "Panama City", country: "Panama", lat: 9.0714, lng: -79.3835, currency: "USD", timezone: "America/Panama" },
  { iata: "SJO", name: "Juan Santamaría International Airport", city: "San José", country: "Costa Rica", lat: 9.9939, lng: -84.2089, currency: "CRC", timezone: "America/Costa_Rica" },
  { iata: "UIO", name: "Mariscal Sucre International Airport", city: "Quito", country: "Ecuador", lat: -0.1292, lng: -78.3575, currency: "USD", timezone: "America/Guayaquil" },
  { iata: "GYE", name: "José Joaquín de Olmedo International Airport", city: "Guayaquil", country: "Ecuador", lat: -2.1574, lng: -79.8836, currency: "USD", timezone: "America/Guayaquil" },

  // AFRICA
  { iata: "JNB", name: "O. R. Tambo International Airport", city: "Johannesburg", country: "South Africa", lat: -26.1392, lng: 28.2460, currency: "ZAR", timezone: "Africa/Johannesburg" },
  { iata: "CPT", name: "Cape Town International Airport", city: "Cape Town", country: "South Africa", lat: -33.9715, lng: 18.6021, currency: "ZAR", timezone: "Africa/Johannesburg" },
  { iata: "CAI", name: "Cairo International Airport", city: "Cairo", country: "Egypt", lat: 30.1219, lng: 31.4056, currency: "EGP", timezone: "Africa/Cairo" },
  { iata: "HRG", name: "Hurghada International Airport", city: "Hurghada", country: "Egypt", lat: 27.1783, lng: 33.7994, currency: "EGP", timezone: "Africa/Cairo" },
  { iata: "CMN", name: "Mohammed V International Airport", city: "Casablanca", country: "Morocco", lat: 33.3675, lng: -7.5899, currency: "MAD", timezone: "Africa/Casablanca" },
  { iata: "RAK", name: "Marrakesh Menara Airport", city: "Marrakesh", country: "Morocco", lat: 31.6069, lng: -8.0363, currency: "MAD", timezone: "Africa/Casablanca" },
  { iata: "NBO", name: "Jomo Kenyatta International Airport", city: "Nairobi", country: "Kenya", lat: -1.3192, lng: 36.9275, currency: "KES", timezone: "Africa/Nairobi" },
  { iata: "ADD", name: "Addis Ababa Bole International Airport", city: "Addis Ababa", country: "Ethiopia", lat: 8.9779, lng: 38.7993, currency: "ETB", timezone: "Africa/Addis_Ababa" },
  { iata: "LOS", name: "Murtala Muhammed International Airport", city: "Lagos", country: "Nigeria", lat: 6.5774, lng: 3.3212, currency: "NGN", timezone: "Africa/Lagos" },
  { iata: "ABV", name: "Nnamdi Azikiwe International Airport", city: "Abuja", country: "Nigeria", lat: 9.0068, lng: 7.2632, currency: "NGN", timezone: "Africa/Lagos" },
  { iata: "ACC", name: "Kotoka International Airport", city: "Accra", country: "Ghana", lat: 5.6052, lng: -0.1668, currency: "GHS", timezone: "Africa/Accra" },
  { iata: "TUN", name: "Tunis–Carthage International Airport", city: "Tunis", country: "Tunisia", lat: 36.8510, lng: 10.2272, currency: "TND", timezone: "Africa/Tunis" },
  { iata: "ALG", name: "Houari Boumediene Airport", city: "Algiers", country: "Algeria", lat: 36.6910, lng: 3.2154, currency: "DZD", timezone: "Africa/Algiers" },
  { iata: "SEZ", name: "Seychelles International Airport", city: "Mahé", country: "Seychelles", lat: -4.6743, lng: 55.5219, currency: "SCR", timezone: "Indian/Mahe" },
  { iata: "MRU", name: "Sir Seewoosagur Ramgoolam International Airport", city: "Mauritius", country: "Mauritius", lat: -20.4302, lng: 57.6836, currency: "MUR", timezone: "Indian/Mauritius" },
  { iata: "EBB", name: "Entebbe International Airport", city: "Kampala / Entebbe", country: "Uganda", lat: 0.0424, lng: 32.4435, currency: "UGX", timezone: "Africa/Kampala" },
  { iata: "KGL", name: "Kigali International Airport", city: "Kigali", country: "Rwanda", lat: -1.9686, lng: 30.1395, currency: "RWF", timezone: "Africa/Kigali" },
  { iata: "DAR", name: "Julius Nyerere International Airport", city: "Dar es Salaam", country: "Tanzania", lat: -6.8781, lng: 39.2026, currency: "TZS", timezone: "Africa/Dar_es_Salaam" },
  { iata: "ZNZ", name: "Abeid Amani Karume International Airport", city: "Zanzibar", country: "Tanzania", lat: -6.2220, lng: 39.2248, currency: "TZS", timezone: "Africa/Dar_es_Salaam" },
  { iata: "JRO", name: "Kilimanjaro International Airport", city: "Kilimanjaro / Arusha", country: "Tanzania", lat: -3.4294, lng: 37.0745, currency: "TZS", timezone: "Africa/Dar_es_Salaam" },
  { iata: "MBA", name: "Moi International Airport", city: "Mombasa", country: "Kenya", lat: -4.0348, lng: 39.5942, currency: "KES", timezone: "Africa/Nairobi" },
  { iata: "DKR", name: "Blaise Diagne International Airport", city: "Dakar", country: "Senegal", lat: 14.6710, lng: -17.0733, currency: "XOF", timezone: "Africa/Dakar" },
  { iata: "ABJ", name: "Félix-Houphouët-Boigny International Airport", city: "Abidjan", country: "Côte d'Ivoire", lat: 5.2614, lng: -3.9263, currency: "XOF", timezone: "Africa/Abidjan" },
  { iata: "DLA", name: "Douala International Airport", city: "Douala", country: "Cameroon", lat: 4.0060, lng: 9.7195, currency: "XAF", timezone: "Africa/Douala" },
  { iata: "FIH", name: "N'djili International Airport", city: "Kinshasa", country: "DR Congo", lat: -4.3858, lng: 15.4446, currency: "CDF", timezone: "Africa/Kinshasa" },
  { iata: "LAD", name: "Quatro de Fevereiro Airport", city: "Luanda", country: "Angola", lat: -8.8584, lng: 13.2312, currency: "AOA", timezone: "Africa/Luanda" },
  { iata: "LUN", name: "Kenneth Kaunda International Airport", city: "Lusaka", country: "Zambia", lat: -15.3308, lng: 28.4526, currency: "ZMW", timezone: "Africa/Lusaka" },
  { iata: "HRE", name: "Robert Gabriel Mugabe International Airport", city: "Harare", country: "Zimbabwe", lat: -17.9318, lng: 31.0928, currency: "USD", timezone: "Africa/Harare" },
  { iata: "VFA", name: "Victoria Falls Airport", city: "Victoria Falls", country: "Zimbabwe", lat: -18.0959, lng: 25.8390, currency: "USD", timezone: "Africa/Harare" },
  { iata: "WDH", name: "Hosea Kutako International Airport", city: "Windhoek", country: "Namibia", lat: -22.4799, lng: 17.4709, currency: "NAD", timezone: "Africa/Windhoek" },
  { iata: "GBE", name: "Sir Seretse Khama International Airport", city: "Gaborone", country: "Botswana", lat: -24.5553, lng: 25.9182, currency: "BWP", timezone: "Africa/Gaborone" },
  { iata: "DUR", name: "King Shaka International Airport", city: "Durban", country: "South Africa", lat: -29.6144, lng: 31.1197, currency: "ZAR", timezone: "Africa/Johannesburg" },

  // NORTH AMERICA & LATIN AMERICA (EXPANDED REGIONAL HUBS)
  { iata: "AUS", name: "Austin-Bergstrom International Airport", city: "Austin", country: "United States", lat: 30.1975, lng: -97.6664, currency: "USD", timezone: "America/Chicago" },
  { iata: "HOU", name: "William P. Hobby Airport", city: "Houston", country: "United States", lat: 29.6454, lng: -95.2789, currency: "USD", timezone: "America/Chicago" },
  { iata: "SAT", name: "San Antonio International Airport", city: "San Antonio", country: "United States", lat: 29.5337, lng: -98.4698, currency: "USD", timezone: "America/Chicago" },
  { iata: "BNA", name: "Nashville International Airport", city: "Nashville", country: "United States", lat: 36.1263, lng: -86.6774, currency: "USD", timezone: "America/Chicago" },
  { iata: "RDU", name: "Raleigh-Durham International Airport", city: "Raleigh", country: "United States", lat: 35.8776, lng: -78.7875, currency: "USD", timezone: "America/New_York" },
  { iata: "CLT", name: "Charlotte Douglas International Airport", city: "Charlotte", country: "United States", lat: 35.2140, lng: -80.9431, currency: "USD", timezone: "America/New_York" },
  { iata: "TPA", name: "Tampa International Airport", city: "Tampa", country: "United States", lat: 27.9755, lng: -82.5332, currency: "USD", timezone: "America/New_York" },
  { iata: "FLL", name: "Fort Lauderdale–Hollywood International Airport", city: "Fort Lauderdale", country: "United States", lat: 26.0726, lng: -80.1527, currency: "USD", timezone: "America/New_York" },
  { iata: "BWI", name: "Baltimore/Washington International Airport", city: "Baltimore", country: "United States", lat: 39.1754, lng: -76.6682, currency: "USD", timezone: "America/New_York" },
  { iata: "CLE", name: "Cleveland Hopkins International Airport", city: "Cleveland", country: "United States", lat: 41.4117, lng: -81.8498, currency: "USD", timezone: "America/New_York" },
  { iata: "PIT", name: "Pittsburgh International Airport", city: "Pittsburgh", country: "United States", lat: 40.4915, lng: -80.2329, currency: "USD", timezone: "America/New_York" },
  { iata: "CMH", name: "John Glenn Columbus International Airport", city: "Columbus", country: "United States", lat: 39.9980, lng: -82.8919, currency: "USD", timezone: "America/New_York" },
  { iata: "IND", name: "Indianapolis International Airport", city: "Indianapolis", country: "United States", lat: 39.7173, lng: -86.2944, currency: "USD", timezone: "America/Indiana/Indianapolis" },
  { iata: "CVG", name: "Cincinnati/Northern Kentucky International Airport", city: "Cincinnati", country: "United States", lat: 39.0488, lng: -84.6678, currency: "USD", timezone: "America/New_York" },
  { iata: "MCI", name: "Kansas City International Airport", city: "Kansas City", country: "United States", lat: 39.2976, lng: -94.7139, currency: "USD", timezone: "America/Chicago" },
  { iata: "STL", name: "St. Louis Lambert International Airport", city: "St. Louis", country: "United States", lat: 38.7487, lng: -90.3700, currency: "USD", timezone: "America/Chicago" },
  { iata: "SMF", name: "Sacramento International Airport", city: "Sacramento", country: "United States", lat: 38.6954, lng: -121.5908, currency: "USD", timezone: "America/Los_Angeles" },
  { iata: "SJC", name: "San Jose Mineta International Airport", city: "San Jose", country: "United States", lat: 37.3626, lng: -121.9291, currency: "USD", timezone: "America/Los_Angeles" },
  { iata: "OAK", name: "Oakland International Airport", city: "Oakland", country: "United States", lat: 37.7213, lng: -122.2208, currency: "USD", timezone: "America/Los_Angeles" },
  { iata: "SNA", name: "John Wayne Airport", city: "Orange County / Santa Ana", country: "United States", lat: 33.6757, lng: -117.8675, currency: "USD", timezone: "America/Los_Angeles" },
  { iata: "OGG", name: "Kahului Airport", city: "Maui / Kahului", country: "United States", lat: 20.8986, lng: -156.4305, currency: "USD", timezone: "Pacific/Honolulu" },
  { iata: "KOA", name: "Ellison Onizuka Kona International Airport", city: "Kona", country: "United States", lat: 19.7388, lng: -156.0456, currency: "USD", timezone: "Pacific/Honolulu" },
  { iata: "YOW", name: "Ottawa Macdonald-Cartier International Airport", city: "Ottawa", country: "Canada", lat: 45.3225, lng: -75.6672, currency: "CAD", timezone: "America/Toronto" },
  { iata: "YEG", name: "Edmonton International Airport", city: "Edmonton", country: "Canada", lat: 53.3097, lng: -113.5798, currency: "CAD", timezone: "America/Edmonton" },
  { iata: "YHZ", name: "Halifax Stanfield International Airport", city: "Halifax", country: "Canada", lat: 44.8808, lng: -63.5086, currency: "CAD", timezone: "America/Halifax" },
  { iata: "YWG", name: "Winnipeg James Armstrong Richardson International Airport", city: "Winnipeg", country: "Canada", lat: 49.9100, lng: -97.2399, currency: "CAD", timezone: "America/Winnipeg" },
  { iata: "MTY", name: "Monterrey International Airport", city: "Monterrey", country: "Mexico", lat: 25.7785, lng: -100.1069, currency: "MXN", timezone: "America/Monterrey" },
  { iata: "TIJ", name: "Tijuana International Airport", city: "Tijuana", country: "Mexico", lat: 32.5411, lng: -116.9702, currency: "MXN", timezone: "America/Tijuana" },
  { iata: "SJD", name: "Los Cabos International Airport", city: "San José del Cabo", country: "Mexico", lat: 23.1518, lng: -109.7214, currency: "MXN", timezone: "America/Mazatlan" },
  { iata: "PVR", name: "Licenciado Gustavo Díaz Ordaz International Airport", city: "Puerto Vallarta", country: "Mexico", lat: 20.6801, lng: -105.2542, currency: "MXN", timezone: "America/Mexico_City" },
  { iata: "PTY", name: "Tocumen International Airport", city: "Panama City", country: "Panama", lat: 9.0714, lng: -79.3835, currency: "PAB", timezone: "America/Panama" },
  { iata: "SJO", name: "Juan Santamaría International Airport", city: "San José", country: "Costa Rica", lat: 9.9939, lng: -84.2088, currency: "CRC", timezone: "America/Costa_Rica" },
  { iata: "SAL", name: "El Salvador International Airport", city: "San Salvador", country: "El Salvador", lat: 13.4409, lng: -89.0557, currency: "USD", timezone: "America/El_Salvador" },
  { iata: "GUA", name: "La Aurora International Airport", city: "Guatemala City", country: "Guatemala", lat: 14.5833, lng: -90.5275, currency: "GTQ", timezone: "America/Guatemala" },
  { iata: "BOG", name: "El Dorado International Airport", city: "Bogotá", country: "Colombia", lat: 4.7016, lng: -74.1469, currency: "COP", timezone: "America/Bogota" },
  { iata: "MDE", name: "José María Córdova International Airport", city: "Medellín", country: "Colombia", lat: 6.1645, lng: -75.4231, currency: "COP", timezone: "America/Bogota" },
  { iata: "CTG", name: "Rafael Núñez International Airport", city: "Cartagena", country: "Colombia", lat: 10.4424, lng: -75.5130, currency: "COP", timezone: "America/Bogota" },
  { iata: "UIO", name: "Mariscal Sucre International Airport", city: "Quito", country: "Ecuador", lat: -0.1292, lng: -78.3575, currency: "USD", timezone: "America/Guayaquil" },
  { iata: "GYE", name: "José Joaquín de Olmedo International Airport", city: "Guayaquil", country: "Ecuador", lat: -2.1574, lng: -79.8836, currency: "USD", timezone: "America/Guayaquil" },
  { iata: "LIM", name: "Jorge Chávez International Airport", city: "Lima", country: "Peru", lat: -12.0219, lng: -77.1143, currency: "PEN", timezone: "America/Lima" },
  { iata: "CUZ", name: "Alejandro Velasco Astete International Airport", city: "Cusco", country: "Peru", lat: -13.5357, lng: -71.9388, currency: "PEN", timezone: "America/Lima" },
  { iata: "SCL", name: "Arturo Merino Benítez International Airport", city: "Santiago", country: "Chile", lat: -33.3930, lng: -70.7858, currency: "CLP", timezone: "America/Santiago" },
  { iata: "EZE", name: "Ministro Pistarini International Airport", city: "Buenos Aires", country: "Argentina", lat: -34.8222, lng: -58.5358, currency: "ARS", timezone: "America/Argentina/Buenos_Aires" },
  { iata: "AEP", name: "Aeroparque Jorge Newbery", city: "Buenos Aires", country: "Argentina", lat: -34.5592, lng: -58.4156, currency: "ARS", timezone: "America/Argentina/Buenos_Aires" },
  { iata: "MVD", name: "Carrasco International Airport", city: "Montevideo", country: "Uruguay", lat: -34.8384, lng: -56.0308, currency: "UYU", timezone: "America/Montevideo" },
  { iata: "ASU", name: "Silvio Pettirossi International Airport", city: "Asunción", country: "Paraguay", lat: -25.2400, lng: -57.5192, currency: "PYG", timezone: "America/Asuncion" },
  { iata: "LPB", name: "El Alto International Airport", city: "La Paz", country: "Bolivia", lat: -16.5133, lng: -68.1923, currency: "BOB", timezone: "America/La_Paz" },
  { iata: "GRU", name: "São Paulo/Guarulhos International Airport", city: "São Paulo", country: "Brazil", lat: -23.4356, lng: -46.4731, currency: "BRL", timezone: "America/Sao_Paulo" },
  { iata: "GIG", name: "Rio de Janeiro/Galeão International Airport", city: "Rio de Janeiro", country: "Brazil", lat: -22.8089, lng: -43.2436, currency: "BRL", timezone: "America/Sao_Paulo" },
  { iata: "BSB", name: "Brasília International Airport", city: "Brasília", country: "Brazil", lat: -15.8692, lng: -47.9172, currency: "BRL", timezone: "America/Sao_Paulo" },

  // EUROPE EXPANDED HUBS
  { iata: "VIE", name: "Vienna International Airport", city: "Vienna", country: "Austria", lat: 48.1103, lng: 16.5697, currency: "EUR", timezone: "Europe/Vienna" },
  { iata: "PRG", name: "Václav Havel Airport Prague", city: "Prague", country: "Czech Republic", lat: 50.1008, lng: 14.2600, currency: "CZK", timezone: "Europe/Prague" },
  { iata: "BUD", name: "Budapest Ferenc Liszt International Airport", city: "Budapest", country: "Hungary", lat: 47.4369, lng: 19.2556, currency: "HUF", timezone: "Europe/Budapest" },
  { iata: "WAW", name: "Warsaw Chopin Airport", city: "Warsaw", country: "Poland", lat: 52.1672, lng: 20.9679, currency: "PLN", timezone: "Europe/Warsaw" },
  { iata: "KRK", name: "Kraków John Paul II International Airport", city: "Kraków", country: "Poland", lat: 50.0777, lng: 19.7848, currency: "PLN", timezone: "Europe/Warsaw" },
  { iata: "BER", name: "Berlin Brandenburg Airport", city: "Berlin", country: "Germany", lat: 52.3667, lng: 13.5033, currency: "EUR", timezone: "Europe/Berlin" },
  { iata: "MUC", name: "Munich Airport", city: "Munich", country: "Germany", lat: 48.3537, lng: 11.7860, currency: "EUR", timezone: "Europe/Berlin" },
  { iata: "HAM", name: "Hamburg Airport", city: "Hamburg", country: "Germany", lat: 53.6304, lng: 9.9882, currency: "EUR", timezone: "Europe/Berlin" },
  { iata: "DUS", name: "Düsseldorf Airport", city: "Düsseldorf", country: "Germany", lat: 51.2895, lng: 6.7668, currency: "EUR", timezone: "Europe/Berlin" },
  { iata: "BRU", name: "Brussels Airport", city: "Brussels", country: "Belgium", lat: 50.9010, lng: 4.4844, currency: "EUR", timezone: "Europe/Brussels" },
  { iata: "GVA", name: "Geneva Airport", city: "Geneva", country: "Switzerland", lat: 46.2370, lng: 6.1092, currency: "CHF", timezone: "Europe/Zurich" },
  { iata: "CPH", name: "Copenhagen Airport", city: "Copenhagen", country: "Denmark", lat: 55.6180, lng: 12.6508, currency: "DKK", timezone: "Europe/Copenhagen" },
  { iata: "ARN", name: "Stockholm Arlanda Airport", city: "Stockholm", country: "Sweden", lat: 59.6498, lng: 17.9238, currency: "SEK", timezone: "Europe/Stockholm" },
  { iata: "OSL", name: "Oslo Airport, Gardermoen", city: "Oslo", country: "Norway", lat: 60.1975, lng: 11.1004, currency: "NOK", timezone: "Europe/Oslo" },
  { iata: "BGO", name: "Bergen Airport, Flesland", city: "Bergen", country: "Norway", lat: 60.2934, lng: 5.2181, currency: "NOK", timezone: "Europe/Oslo" },
  { iata: "HEL", name: "Helsinki-Vantaa Airport", city: "Helsinki", country: "Finland", lat: 60.3172, lng: 24.9633, currency: "EUR", timezone: "Europe/Helsinki" },
  { iata: "KEF", name: "Keflavík International Airport", city: "Reykjavík", country: "Iceland", lat: 63.9850, lng: -22.6056, currency: "ISK", timezone: "Atlantic/Reykjavik" },
  { iata: "MAD", name: "Adolfo Suárez Madrid–Barajas Airport", city: "Madrid", country: "Spain", lat: 40.4839, lng: -3.5680, currency: "EUR", timezone: "Europe/Madrid" },
  { iata: "BCN", name: "Josep Tarradellas Barcelona-El Prat Airport", city: "Barcelona", country: "Spain", lat: 41.2974, lng: 2.0833, currency: "EUR", timezone: "Europe/Madrid" },
  { iata: "AGP", name: "Málaga-Costa del Sol Airport", city: "Málaga", country: "Spain", lat: 36.6749, lng: -4.4991, currency: "EUR", timezone: "Europe/Madrid" },
  { iata: "PMI", name: "Palma de Mallorca Airport", city: "Palma de Mallorca", country: "Spain", lat: 39.5517, lng: 2.7388, currency: "EUR", timezone: "Europe/Madrid" },
  { iata: "LIS", name: "Humberto Delgado Airport", city: "Lisbon", country: "Portugal", lat: 38.7742, lng: -9.1342, currency: "EUR", timezone: "Europe/Lisbon" },
  { iata: "OPO", name: "Francisco Sá Carneiro Airport", city: "Porto", country: "Portugal", lat: 41.2421, lng: -8.6814, currency: "EUR", timezone: "Europe/Lisbon" },
  { iata: "FAO", name: "Faro Airport", city: "Faro", country: "Portugal", lat: 37.0144, lng: -7.9659, currency: "EUR", timezone: "Europe/Lisbon" },
  { iata: "FCO", name: "Leonardo da Vinci–Fiumicino Airport", city: "Rome", country: "Italy", lat: 41.8003, lng: 12.2389, currency: "EUR", timezone: "Europe/Rome" },
  { iata: "MXP", name: "Milan Malpensa Airport", city: "Milan", country: "Italy", lat: 45.6301, lng: 8.7255, currency: "EUR", timezone: "Europe/Rome" },
  { iata: "VCE", name: "Venice Marco Polo Airport", city: "Venice", country: "Italy", lat: 45.5053, lng: 12.3519, currency: "EUR", timezone: "Europe/Rome" },
  { iata: "NAP", name: "Naples International Airport", city: "Naples", country: "Italy", lat: 40.8844, lng: 14.2908, currency: "EUR", timezone: "Europe/Rome" },
  { iata: "ATH", name: "Athens International Airport", city: "Athens", country: "Greece", lat: 37.9364, lng: 23.9445, currency: "EUR", timezone: "Europe/Athens" },
  { iata: "HER", name: "Heraklion International Airport", city: "Heraklion / Crete", country: "Greece", lat: 35.3397, lng: 25.1803, currency: "EUR", timezone: "Europe/Athens" },
  { iata: "LCA", name: "Larnaca International Airport", city: "Larnaca", country: "Cyprus", lat: 34.8751, lng: 33.6249, currency: "EUR", timezone: "Asia/Nicosia" },
  { iata: "MLA", name: "Malta International Airport", city: "Luqa", country: "Malta", lat: 35.8575, lng: 14.4775, currency: "EUR", timezone: "Europe/Malta" },
  { iata: "OTP", name: "Henri Coandă International Airport", city: "Bucharest", country: "Romania", lat: 44.5711, lng: 26.0850, currency: "RON", timezone: "Europe/Bucharest" },
  { iata: "SOF", name: "Sofia Airport", city: "Sofia", country: "Bulgaria", lat: 42.6952, lng: 23.4062, currency: "BGN", timezone: "Europe/Sofia" },
  { iata: "BEG", name: "Belgrade Nikola Tesla Airport", city: "Belgrade", country: "Serbia", lat: 44.8184, lng: 20.3091, currency: "RSD", timezone: "Europe/Belgrade" },
  { iata: "ZAG", name: "Zagreb Airport", city: "Zagreb", country: "Croatia", lat: 45.7429, lng: 16.0688, currency: "EUR", timezone: "Europe/Zagreb" },
  { iata: "DBV", name: "Dubrovnik Airport", city: "Dubrovnik", country: "Croatia", lat: 42.5614, lng: 18.2682, currency: "EUR", timezone: "Europe/Zagreb" },

  // ASIA, MIDDLE EAST & OCEANIA EXPANDED
  { iata: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "China", lat: 40.0799, lng: 116.6031, currency: "CNY", timezone: "Asia/Shanghai" },
  { iata: "PKX", name: "Beijing Daxing International Airport", city: "Beijing", country: "China", lat: 39.5098, lng: 116.4105, currency: "CNY", timezone: "Asia/Shanghai" },
  { iata: "PVG", name: "Shanghai Pudong International Airport", city: "Shanghai", country: "China", lat: 31.1443, lng: 121.8083, currency: "CNY", timezone: "Asia/Shanghai" },
  { iata: "SHA", name: "Shanghai Hongqiao International Airport", city: "Shanghai", country: "China", lat: 31.1979, lng: 121.3363, currency: "CNY", timezone: "Asia/Shanghai" },
  { iata: "CAN", name: "Guangzhou Baiyun International Airport", city: "Guangzhou", country: "China", lat: 23.3924, lng: 113.2988, currency: "CNY", timezone: "Asia/Shanghai" },
  { iata: "SZX", name: "Shenzhen Bao'an International Airport", city: "Shenzhen", country: "China", lat: 22.6393, lng: 113.8107, currency: "CNY", timezone: "Asia/Shanghai" },
  { iata: "CTU", name: "Chengdu Shuangliu International Airport", city: "Chengdu", country: "China", lat: 30.5785, lng: 103.9471, currency: "CNY", timezone: "Asia/Shanghai" },
  { iata: "TPE", name: "Taiwan Taoyuan International Airport", city: "Taipei", country: "Taiwan", lat: 25.0797, lng: 121.2342, currency: "TWD", timezone: "Asia/Taipei" },
  { iata: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea", lat: 37.4602, lng: 126.4407, currency: "KRW", timezone: "Asia/Seoul" },
  { iata: "GMP", name: "Gimpo International Airport", city: "Seoul", country: "South Korea", lat: 37.5583, lng: 126.7906, currency: "KRW", timezone: "Asia/Seoul" },
  { iata: "PUS", name: "Gimhae International Airport", city: "Busan", country: "South Korea", lat: 35.1795, lng: 128.9382, currency: "KRW", timezone: "Asia/Seoul" },
  { iata: "KIX", name: "Kansai International Airport", city: "Osaka", country: "Japan", lat: 34.4347, lng: 135.2327, currency: "JPY", timezone: "Asia/Tokyo" },
  { iata: "FUK", name: "Fukuoka Airport", city: "Fukuoka", country: "Japan", lat: 33.5859, lng: 130.4507, currency: "JPY", timezone: "Asia/Tokyo" },
  { iata: "CTS", name: "New Chitose Airport", city: "Sapporo", country: "Japan", lat: 42.7752, lng: 141.6923, currency: "JPY", timezone: "Asia/Tokyo" },
  { iata: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand", lat: 13.6900, lng: 100.7501, currency: "THB", timezone: "Asia/Bangkok" },
  { iata: "DMK", name: "Don Mueang International Airport", city: "Bangkok", country: "Thailand", lat: 13.9126, lng: 100.6068, currency: "THB", timezone: "Asia/Bangkok" },
  { iata: "HKT", name: "Phuket International Airport", city: "Phuket", country: "Thailand", lat: 8.1132, lng: 98.3169, currency: "THB", timezone: "Asia/Bangkok" },
  { iata: "CNX", name: "Chiang Mai International Airport", city: "Chiang Mai", country: "Thailand", lat: 18.7700, lng: 98.9626, currency: "THB", timezone: "Asia/Bangkok" },
  { iata: "KUL", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", country: "Malaysia", lat: 2.7456, lng: 101.7072, currency: "MYR", timezone: "Asia/Kuala_Lumpur" },
  { iata: "PEN", name: "Penang International Airport", city: "Penang", country: "Malaysia", lat: 5.2971, lng: 100.2769, currency: "MYR", timezone: "Asia/Kuala_Lumpur" },
  { iata: "CGK", name: "Soekarno–Hatta International Airport", city: "Jakarta", country: "Indonesia", lat: -6.1256, lng: 106.6558, currency: "IDR", timezone: "Asia/Jakarta" },
  { iata: "DPS", name: "I Gusti Ngurah Rai International Airport", city: "Bali / Denpasar", country: "Indonesia", lat: -8.7482, lng: 115.1672, currency: "IDR", timezone: "Asia/Makassar" },
  { iata: "MNL", name: "Ninoy Aquino International Airport", city: "Manila", country: "Philippines", lat: 14.5086, lng: 121.0194, currency: "PHP", timezone: "Asia/Manila" },
  { iata: "CEB", name: "Mactan–Cebu International Airport", city: "Cebu", country: "Philippines", lat: 10.3075, lng: 123.9794, currency: "PHP", timezone: "Asia/Manila" },
  { iata: "SGN", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City", country: "Vietnam", lat: 10.8188, lng: 106.6519, currency: "VND", timezone: "Asia/Ho_Chi_Minh" },
  { iata: "HAN", name: "Noi Bai International Airport", city: "Hanoi", country: "Vietnam", lat: 21.2212, lng: 105.8072, currency: "VND", timezone: "Asia/Ho_Chi_Minh" },
  { iata: "DAD", name: "Da Nang International Airport", city: "Da Nang", country: "Vietnam", lat: 16.0439, lng: 108.1994, currency: "VND", timezone: "Asia/Ho_Chi_Minh" },
  { iata: "KTM", name: "Tribhuvan International Airport", city: "Kathmandu", country: "Nepal", lat: 27.6966, lng: 85.3591, currency: "NPR", timezone: "Asia/Kathmandu" },
  { iata: "CMB", name: "Bandaranaike International Airport", city: "Colombo", country: "Sri Lanka", lat: 7.1808, lng: 79.8841, currency: "LKR", timezone: "Asia/Colombo" },
  { iata: "MLE", name: "Velana International Airport", city: "Malé", country: "Maldives", lat: 4.1918, lng: 73.5292, currency: "MVR", timezone: "Indian/Maldives" },
  { iata: "DAC", name: "Hazrat Shahjalal International Airport", city: "Dhaka", country: "Bangladesh", lat: 23.8433, lng: 90.3978, currency: "BDT", timezone: "Asia/Dhaka" },
  { iata: "ISB", name: "Islamabad International Airport", city: "Islamabad", country: "Pakistan", lat: 33.5492, lng: 72.8272, currency: "PKR", timezone: "Asia/Karachi" },
  { iata: "KHI", name: "Jinnah International Airport", city: "Karachi", country: "Pakistan", lat: 24.9065, lng: 67.1608, currency: "PKR", timezone: "Asia/Karachi" },
  { iata: "LHE", name: "Allama Iqbal International Airport", city: "Lahore", country: "Pakistan", lat: 31.5216, lng: 74.4036, currency: "PKR", timezone: "Asia/Karachi" },
  { iata: "TAS", name: "Islam Karimov Tashkent International Airport", city: "Tashkent", country: "Uzbekistan", lat: 41.2579, lng: 69.2812, currency: "UZS", timezone: "Asia/Tashkent" },
  { iata: "ALA", name: "Almaty International Airport", city: "Almaty", country: "Kazakhstan", lat: 43.3521, lng: 77.0405, currency: "KZT", timezone: "Asia/Almaty" },
  { iata: "AUH", name: "Zayed International Airport", city: "Abu Dhabi", country: "United Arab Emirates", lat: 24.4330, lng: 54.6511, currency: "AED", timezone: "Asia/Dubai" },
  { iata: "DOH", name: "Hamad International Airport", city: "Doha", country: "Qatar", lat: 25.2731, lng: 51.6081, currency: "QAR", timezone: "Asia/Qatar" },
  { iata: "BAH", name: "Bahrain International Airport", city: "Manama", country: "Bahrain", lat: 26.2708, lng: 50.6336, currency: "BHD", timezone: "Asia/Bahrain" },
  { iata: "KWI", name: "Kuwait International Airport", city: "Kuwait City", country: "Kuwait", lat: 29.2267, lng: 47.9789, currency: "KWD", timezone: "Asia/Kuwait" },
  { iata: "MCT", name: "Muscat International Airport", city: "Muscat", country: "Oman", lat: 23.5933, lng: 58.2844, currency: "OMR", timezone: "Asia/Muscat" },
  { iata: "RUH", name: "King Khalid International Airport", city: "Riyadh", country: "Saudi Arabia", lat: 24.9576, lng: 46.6988, currency: "SAR", timezone: "Asia/Riyadh" },
  { iata: "JED", name: "King Abdulaziz International Airport", city: "Jeddah", country: "Saudi Arabia", lat: 21.6796, lng: 39.1565, currency: "SAR", timezone: "Asia/Riyadh" },
  { iata: "DMM", name: "King Fahd International Airport", city: "Dammam", country: "Saudi Arabia", lat: 26.4712, lng: 49.7979, currency: "SAR", timezone: "Asia/Riyadh" },
  { iata: "MED", name: "Prince Mohammad bin Abdulaziz Airport", city: "Medina", country: "Saudi Arabia", lat: 24.5534, lng: 39.7051, currency: "SAR", timezone: "Asia/Riyadh" },
  { iata: "AMM", name: "Queen Alia International Airport", city: "Amman", country: "Jordan", lat: 31.7226, lng: 35.9932, currency: "JOD", timezone: "Asia/Amman" },
  { iata: "BEY", name: "Beirut–Rafic Hariri International Airport", city: "Beirut", country: "Lebanon", lat: 33.8209, lng: 35.4884, currency: "USD", timezone: "Asia/Beirut" },
  { iata: "TLV", name: "Ben Gurion Airport", city: "Tel Aviv", country: "Israel", lat: 32.0055, lng: 34.8854, currency: "ILS", timezone: "Asia/Jerusalem" },
  { iata: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", lat: 41.2753, lng: 28.7519, currency: "TRY", timezone: "Europe/Istanbul" },
  { iata: "SAW", name: "Istanbul Sabiha Gökçen Airport", city: "Istanbul", country: "Turkey", lat: 40.8986, lng: 29.3092, currency: "TRY", timezone: "Europe/Istanbul" },
  { iata: "AYT", name: "Antalya Airport", city: "Antalya", country: "Turkey", lat: 36.8987, lng: 30.8005, currency: "TRY", timezone: "Europe/Istanbul" },
  { iata: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia", lat: -37.6690, lng: 144.8410, currency: "AUD", timezone: "Australia/Melbourne" },
  { iata: "BNE", name: "Brisbane Airport", city: "Brisbane", country: "Australia", lat: -27.3842, lng: 153.1175, currency: "AUD", timezone: "Australia/Brisbane" },
  { iata: "PER", name: "Perth Airport", city: "Perth", country: "Australia", lat: -31.9403, lng: 115.9669, currency: "AUD", timezone: "Australia/Perth" },
  { iata: "ADL", name: "Adelaide Airport", city: "Adelaide", country: "Australia", lat: -34.9450, lng: 138.5306, currency: "AUD", timezone: "Australia/Adelaide" },
  { iata: "AKL", name: "Auckland Airport", city: "Auckland", country: "New Zealand", lat: -37.0082, lng: 174.7850, currency: "NZD", timezone: "Pacific/Auckland" },
  { iata: "WLG", name: "Wellington International Airport", city: "Wellington", country: "New Zealand", lat: -41.3272, lng: 174.8053, currency: "NZD", timezone: "Pacific/Auckland" },
  { iata: "CHC", name: "Christchurch International Airport", city: "Christchurch", country: "New Zealand", lat: -43.4894, lng: 172.5322, currency: "NZD", timezone: "Pacific/Auckland" },
  { iata: "NAN", name: "Nadi International Airport", city: "Nadi", country: "Fiji", lat: -17.7554, lng: 177.4434, currency: "FJD", timezone: "Pacific/Fiji" },
  { iata: "PPT", name: "Fa'a'ā International Airport", city: "Papeete / Tahiti", country: "French Polynesia", lat: -17.5537, lng: -149.6067, currency: "XPF", timezone: "Pacific/Tahiti" },

  // INDIA (COMPREHENSIVE AIR NETWORK)
  { iata: "BLR", name: "Kempegowda International Airport", city: "Bengaluru", country: "India", lat: 13.1986, lng: 77.7066, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "HYD", name: "Rajiv Gandhi International Airport", city: "Hyderabad", country: "India", lat: 17.2403, lng: 78.4294, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "CCU", name: "Netaji Subhash Chandra Bose International Airport", city: "Kolkata", country: "India", lat: 22.6547, lng: 88.4467, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "MAA", name: "Chennai International Airport", city: "Chennai", country: "India", lat: 12.9941, lng: 80.1709, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "COK", name: "Cochin International Airport", city: "Kochi", country: "India", lat: 10.1518, lng: 76.3930, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "AMD", name: "Sardar Vallabhbhai Patel International Airport", city: "Ahmedabad", country: "India", lat: 23.0772, lng: 72.6347, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "GOI", name: "Dabolim Airport", city: "Goa (Dabolim)", country: "India", lat: 15.3808, lng: 73.8313, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "GOX", name: "Manohar International Airport", city: "Goa (Mopa)", country: "India", lat: 15.7667, lng: 73.8667, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "TRV", name: "Thiruvananthapuram International Airport", city: "Trivandrum", country: "India", lat: 8.4821, lng: 76.9200, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "PNQ", name: "Pune Airport", city: "Pune", country: "India", lat: 18.5821, lng: 73.9197, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "JAI", name: "Jaipur International Airport", city: "Jaipur", country: "India", lat: 26.8242, lng: 75.8122, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "LKO", name: "Chaudhary Charan Singh International Airport", city: "Lucknow", country: "India", lat: 26.7606, lng: 80.8893, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "ATQ", name: "Sri Guru Ram Dass Jee International Airport", city: "Amritsar", country: "India", lat: 31.7096, lng: 74.7973, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "IXC", name: "Shaheed Bhagat Singh International Airport", city: "Chandigarh", country: "India", lat: 30.6735, lng: 76.7885, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "GAU", name: "Lokpriya Gopinath Bordoloi International Airport", city: "Guwahati", country: "India", lat: 26.1061, lng: 91.5859, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "BBI", name: "Biju Patnaik Airport", city: "Bhubaneswar", country: "India", lat: 20.2444, lng: 85.8178, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "SXR", name: "Sheikh ul-Alam International Airport", city: "Srinagar", country: "India", lat: 33.9871, lng: 74.7741, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "VNS", name: "Lal Bahadur Shastri International Airport", city: "Varanasi", country: "India", lat: 25.4524, lng: 82.8593, currency: "INR", timezone: "Asia/Kolkata" },
  { iata: "IXZ", name: "Veer Savarkar International Airport", city: "Port Blair", country: "India", lat: 11.6410, lng: 92.7297, currency: "INR", timezone: "Asia/Kolkata" },

  // ANTARCTICA & REMOTE AIRFIELDS
  { iata: "TNM", name: "Teniente R. Marsh Airport", city: "King George Island", country: "Antarctica", lat: -62.1908, lng: -58.9867, currency: "USD", timezone: "Antarctica/Troll" },
  { iata: "LYR", name: "Svalbard Airport, Longyear", city: "Longyearbyen", country: "Norway / Svalbard", lat: 78.2461, lng: 15.4656, currency: "NOK", timezone: "Arctic/Longyearbyen" },
];

// Deduplicate AIRPORTS by unique IATA code to prevent React key collision
export const AIRPORTS = Array.from(
  new Map(RAW_AIRPORTS.map((a) => [a.iata, a])).values()
);

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const v0 = new Array(b.length + 1);
  const v1 = new Array(b.length + 1);
  for (let i = 0; i <= b.length; i++) v0[i] = i;
  for (let i = 0; i < a.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= b.length; j++) v0[j] = v1[j];
  }
  return v1[b.length];
}

const COMMON_CITY_TYPOS = {
  tokio: "Tokyo",
  londn: "London",
  londond: "London",
  pariss: "Paris",
  pari: "Paris",
  dubayy: "Dubai",
  dubay: "Dubai",
  mumbay: "Mumbai",
  bombay: "Mumbai",
  delhy: "Delhi",
  dilli: "Delhi",
  singapor: "Singapore",
  singapoor: "Singapore",
  sidney: "Sydney",
  sydny: "Sydney",
  frankfurt: "Frankfurt",
  frankfort: "Frankfurt",
  amsterdm: "Amsterdam",
  barcelna: "Barcelona",
  newyork: "New York",
  ny: "New York",
  nyc: "New York",
  sanfran: "San Francisco",
  sf: "San Francisco",
  la: "Los Angeles",
  losangeles: "Los Angeles",
  chicago: "Chicago",
  chicgo: "Chicago",
  toranto: "Toronto",
  toranta: "Toronto",
  rome: "Rome",
  roma: "Rome",
  bangkok: "Bangkok",
  bankok: "Bangkok",
};

/**
 * Enhanced global airport search engine.
 * Supports IATA matching, city, country, airport name, phonetic typos, and Levenshtein fuzzy search.
 */
export function searchAirports(query) {
  if (!query || query.trim().length < 1) return AIRPORTS.slice(0, 8);
  let q = query.toLowerCase().trim();

  // Spell-check alias normalization
  if (COMMON_CITY_TYPOS[q]) {
    q = COMMON_CITY_TYPOS[q].toLowerCase();
  }

  // 1. Exact IATA match priority (case-insensitive)
  const exactIata = AIRPORTS.filter((a) => a.iata.toLowerCase() === q);
  
  // 2. Prefix IATA match
  const prefixIata = AIRPORTS.filter((a) => a.iata.toLowerCase().startsWith(q) && a.iata.toLowerCase() !== q);

  // 3. Exact city match
  const exactCity = AIRPORTS.filter((a) => a.city.toLowerCase() === q);

  // 4. Substring in city, name, or country
  const others = AIRPORTS.filter(
    (a) =>
      !a.iata.toLowerCase().startsWith(q) &&
      a.city.toLowerCase() !== q &&
      (a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q))
  );

  let combined = [...exactIata, ...prefixIata, ...exactCity, ...others];

  // 5. Fuzzy / Typo Fallback via Levenshtein if no matches
  if (combined.length === 0 && q.length >= 3) {
    const scored = AIRPORTS.map((a) => {
      const cityDist = levenshtein(q, a.city.toLowerCase());
      const nameDist = levenshtein(q, a.name.toLowerCase().slice(0, q.length + 3));
      const iataDist = levenshtein(q, a.iata.toLowerCase());
      return {
        airport: a,
        dist: Math.min(cityDist, nameDist, iataDist),
      };
    })
      .filter((item) => item.dist <= (q.length > 5 ? 2 : 1))
      .sort((a, b) => a.dist - b.dist);

    combined = scored.map((s) => s.airport);
  }
  
  // Deduplicate
  const seen = new Set();
  const results = [];
  for (const item of combined) {
    if (!seen.has(item.iata)) {
      seen.add(item.iata);
      results.push(item);
    }
  }

  return results.slice(0, 10);
}


/**
 * Finds airport by IATA code or creates a dynamic global placeholder for any unknown IATA code
 */
export function getAirportByIata(iataCode) {
  if (!iataCode) return null;
  const found = AIRPORTS.find((a) => a.iata.toUpperCase() === iataCode.toUpperCase());
  if (found) return found;

  // Dynamic fallback for any IATA code on Earth
  return {
    iata: iataCode.toUpperCase(),
    name: `${iataCode.toUpperCase()} International Airport`,
    city: `City of ${iataCode.toUpperCase()}`,
    country: "Global Airport",
    lat: 20.0 + (iataCode.charCodeAt(0) % 40) - 20,
    lng: 10.0 + (iataCode.charCodeAt(1) % 180) - 90,
    currency: "USD",
    timezone: "UTC",
  };
}
