import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import FlightSearchEngine from "../components/booking/FlightSearchEngine";
import { useStore } from "../store/useStore";
import { Plane, CheckCircle2 } from "lucide-react";
import { AIRPORTS, getAirportByIata } from "../data/airports";

const POPULAR_ROUTES = [
  { originCode: "DEL", destCode: "BOM", label: "Delhi → Mumbai", airline: "IndiGo · SpiceJet" },
  { originCode: "DEL", destCode: "BLR", label: "Delhi → Bengaluru", airline: "IndiGo · SpiceJet" },
  { originCode: "DEL", destCode: "DXB", label: "Delhi → Dubai", airline: "IndiGo · Emirates" },
  { originCode: "JFK", destCode: "LHR", label: "New York → London", airline: "British Airways · Virgin" },
  { originCode: "DXB", destCode: "JFK", label: "Dubai → New York", airline: "Emirates · Etihad" },
  { originCode: "SIN", destCode: "HND", label: "Singapore → Tokyo", airline: "Singapore Airlines · ANA" },
];

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const fromParam = searchParams.get("from")?.toUpperCase();
  const toParam = searchParams.get("to")?.toUpperCase();

  const waypoints = useStore((s) => s.waypoints);
  const searchOrigin = useStore((s) => s.searchOrigin);
  const searchDestination = useStore((s) => s.searchDestination);
  const setSearchOrigin = useStore((s) => s.setSearchOrigin);
  const setSearchDestination = useStore((s) => s.setSearchDestination);
  const validWps = useMemo(() => (waypoints || []).filter(Boolean), [waypoints]);

  const [selectedPreset, setSelectedPreset] = useState(null);

  // Compute active initial airports prioritizing:
  // 1. Clicked preset
  // 2. URL search parameters (?from=...&to=...)
  // 3. Store waypoints
  // 4. Store searchOrigin / searchDestination
  // 5. Default AIRPORTS
  const initialOrigin = useMemo(() => {
    if (selectedPreset) {
      return getAirportByIata(selectedPreset.originCode) || AIRPORTS[0];
    }
    if (fromParam) {
      const found = getAirportByIata(fromParam);
      if (found) return found;
    }
    return validWps[0] || searchOrigin || AIRPORTS[0];
  }, [selectedPreset, fromParam, validWps, searchOrigin]);

  const initialDestination = useMemo(() => {
    if (selectedPreset) {
      return getAirportByIata(selectedPreset.destCode) || AIRPORTS[1];
    }
    if (toParam) {
      const found = getAirportByIata(toParam);
      if (found) return found;
    }
    return validWps.length >= 2
      ? validWps[validWps.length - 1]
      : searchDestination || AIRPORTS[1];
  }, [selectedPreset, toParam, validWps, searchDestination]);

  const handleSelectPreset = (route) => {
    setSelectedPreset(route);
    const orig = getAirportByIata(route.originCode);
    const dest = getAirportByIata(route.destCode);
    if (orig && dest) {
      setSearchOrigin(orig);
      setSearchDestination(dest);
    }
  };

  const hasPresetOrDeepLink = !!((fromParam && toParam) || selectedPreset || (validWps.length >= 2));

  return (
    <div
      id="booking-page"
      className="min-h-screen pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pt-24 sm:pt-28 animate-fade-in"
    >
      {/* ── Page Header ─────────────────────────────────────────── */}
      <FlightSearchEngine
        initialOrigin={initialOrigin}
        initialDestination={initialDestination}
      />
    </div>
  );
}

