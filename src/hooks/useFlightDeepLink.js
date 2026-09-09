import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { AIRPORTS, getAirportByIata } from "../data/airports";

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
  const isHydratedRef = useRef(false);

  // Step 1 & 3: Read URL once on mount, hydrate state, and trigger search
  useEffect(() => {
    if (typeof window === "undefined" || isHydratedRef.current) return;

    const fromCode = searchParams.get("from")?.toUpperCase();
    const toCode = searchParams.get("to")?.toUpperCase();
    const dateParam = searchParams.get("date");

    let hydrated = false;

    if (fromCode) {
      const found = getAirportByIata(fromCode);
      if (found) {
        setOrigin(found);
        hydrated = true;
      }
    }

    if (toCode) {
      const found = getAirportByIata(toCode);
      if (found) {
        setDestination(found);
        hydrated = true;
      }
    }

    if (dateParam) {
      setDepartureDate(dateParam);
    }

    isHydratedRef.current = true;

    if (hydrated && fromCode && toCode && triggerSearch) {
      triggerSearch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Step 1: Update URL parameters ONLY when user triggers search/changes route after initial hydration
  const syncUrlParams = useCallback((newOrigin, newDest, newDate) => {
    if (typeof window === "undefined") return;

    const curFrom = searchParams.get("from")?.toUpperCase();
    const curTo = searchParams.get("to")?.toUpperCase();
    const curDate = searchParams.get("date");

    const nextFrom = (newOrigin?.iata || newOrigin?.code || "").toUpperCase();
    const nextTo = (newDest?.iata || newDest?.code || "").toUpperCase();
    const nextDate = newDate || "";

    // Skip if URL is already identical
    if (curFrom === nextFrom && curTo === nextTo && (!nextDate || curDate === nextDate)) {
      return;
    }

    const params = {};
    if (nextFrom) params.from = nextFrom;
    if (nextTo) params.to = nextTo;
    if (nextDate) params.date = nextDate;

    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  return { syncUrlParams };
}
