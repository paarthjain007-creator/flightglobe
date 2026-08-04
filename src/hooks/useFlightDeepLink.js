import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { AIRPORTS } from "../data/airports";

/**
 * useFlightDeepLink
 * Syncs origin/destination flight search state bidirectionally with the URL.
 *
 * - On mount: reads ?from=DEL&to=BOM from URL and triggers the search.
 * - On state change: pushes updated params to the URL (browser history entry).
 * - Back/forward navigation: handled natively by React Router's useSearchParams.
 *
 * @param {Object} params
 * @param {Object|null} params.origin       - Current origin airport object
 * @param {Object|null} params.destination  - Current destination airport object
 * @param {string} params.departureDate     - ISO date string
 * @param {(airport: Object) => void} params.setOrigin
 * @param {(airport: Object) => void} params.setDestination
 * @param {(date: string) => void} params.setDepartureDate
 * @param {() => void} params.triggerSearch
 */
export function useFlightDeepLink({
  origin,
  destination,
  departureDate,
  setOrigin,
  setDestination,
  setDepartureDate,
  triggerSearch,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const didMountRef = useRef(false);

  // ACTION 2: On mount, read URL params and hydrate state + trigger search
  useEffect(() => {
    const fromCode = searchParams.get("from")?.toUpperCase();
    const toCode   = searchParams.get("to")?.toUpperCase();
    const dateParam = searchParams.get("date");

    let changed = false;

    if (fromCode) {
      const found = AIRPORTS.find((a) => a.iata === fromCode);
      if (found) {
        setOrigin(found);
        changed = true;
      }
    }

    if (toCode) {
      const found = AIRPORTS.find((a) => a.iata === toCode);
      if (found) {
        setDestination(found);
        changed = true;
      }
    }

    if (dateParam) {
      setDepartureDate(dateParam);
    }

    // Auto-trigger search if both locations were hydrated from URL
    if (changed && fromCode && toCode) {
      // Defer one tick so state setters have resolved
      setTimeout(() => triggerSearch(), 50);
    }

    didMountRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount only

  // ACTION 1: Whenever origin/destination/date changes (after mount), push to URL
  useEffect(() => {
    if (!didMountRef.current) return;

    const params = {};
    if (origin?.iata)      params.from = origin.iata;
    if (destination?.iata) params.to   = destination.iata;
    if (departureDate)     params.date  = departureDate;

    setSearchParams(params, { replace: false }); // push = true → enables back/fwd navigation
  }, [origin?.iata, destination?.iata, departureDate]); // eslint-disable-line
}
