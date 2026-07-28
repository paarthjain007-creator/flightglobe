import { useState, useEffect, useRef } from "react";
import { AIRPORTS } from "../data/airports";

/**
 * Generate simulated live flights around a target airport
 * when offline or when OpenSky API rate-limits/fails.
 */
function generateMockFlightsAround(centerAirport, count = 12) {
  const baseLat = centerAirport?.lat ?? 40.6413;
  const baseLng = centerAirport?.lng ?? -73.7781;
  const centerIata = centerAirport?.iata ?? "JFK";

  const airlines = ["DL", "UA", "AA", "BA", "EK", "AF", "LH", "SQ", "NH", "QF"];
  const otherAirports = AIRPORTS.filter((a) => a.iata !== centerIata);

  const flights = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI + Math.random() * 0.3;
    const distanceDeg = 0.8 + Math.random() * 3.5;
    const lat = baseLat + Math.sin(angle) * distanceDeg;
    const lng = baseLng + Math.cos(angle) * distanceDeg;
    
    const targetAp = otherAirports[i % otherAirports.length];
    const airline = airlines[i % airlines.length];
    const flightNumber = `${airline}${100 + Math.floor(Math.random() * 899)}`;

    flights.push({
      id: `mock-${centerIata}-${i}`,
      callsign: flightNumber,
      lat,
      lng,
      altitudeMeters: Math.floor(7000 + Math.random() * 5000),
      altitudeFeet: Math.floor(23000 + Math.random() * 16000),
      velocityKmh: Math.floor(750 + Math.random() * 180),
      heading: Math.floor(Math.random() * 360),
      origin: i % 2 === 0 ? centerIata : targetAp.iata,
      destination: i % 2 === 0 ? targetAp.iata : centerIata,
      isLive: true,
      isSimulated: true,
    });
  }
  return flights;
}

export function useLiveFlights(destinationAirport, enabled = true) {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isSimulated, setIsSimulated] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    if (!enabled) {
      setFlights([]);
      return;
    }

    async function fetchLiveFlights() {
      if (!isMounted) return;
      setLoading(true);
      setError(null);

      const target = destinationAirport || AIRPORTS[0];
      const delta = 4.0;
      const lamin = (target.lat - delta).toFixed(4);
      const lamax = (target.lat + delta).toFixed(4);
      const lomin = (target.lng - delta).toFixed(4);
      const lomax = (target.lng + delta).toFixed(4);

      const url = `https://opensky-network.org/api/states/all?lamin=${lamin}&lamax=${lamax}&lomin=${lomin}&lomax=${lomax}`;

      let controller;
      let timeoutId;

      try {
        controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(url, { signal: controller.signal });
        if (timeoutId) clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`OpenSky status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!isMounted) return;

        if (data && Array.isArray(data.states) && data.states.length > 0) {
          const parsed = data.states
            .filter((st) => st[5] !== null && st[6] !== null && !st[8])
            .slice(0, 25)
            .map((st, idx) => {
              const callsign = (st[1] || `FLT-${st[0].substring(0, 4)}`).trim();
              const lng = st[5];
              const lat = st[6];
              const altM = Math.round(st[7] || 9000);
              const velMs = st[9] || 230;
              const heading = Math.round(st[10] || 0);

              return {
                id: st[0] || `live-${idx}`,
                callsign,
                country: st[2] || "Unknown",
                lat,
                lng,
                altitudeMeters: altM,
                altitudeFeet: Math.round(altM * 3.28084),
                velocityKmh: Math.round(velMs * 3.6),
                heading,
                origin: st[2] ? st[2].substring(0, 3).toUpperCase() : "DEP",
                destination: target.iata,
                isLive: true,
                isSimulated: false,
              };
            });

          setFlights(parsed);
          setIsSimulated(false);
        } else {
          const mock = generateMockFlightsAround(target, 14);
          setFlights(mock);
          setIsSimulated(true);
        }
      } catch (err) {
        if (!isMounted) return;
        const mock = generateMockFlightsAround(target, 14);
        setFlights(mock);
        setIsSimulated(true);
        setError(err.name === "AbortError" ? "API request timed out (using live telemetry simulation)" : "Network/CORS restricted (using live telemetry simulation)");
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        if (isMounted) {
          setLoading(false);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      }
    }

    fetchLiveFlights();

    timerRef.current = setInterval(fetchLiveFlights, 12000);

    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [destinationAirport?.iata, enabled]);

  return { flights, loading, error, lastUpdated, isSimulated };
}
