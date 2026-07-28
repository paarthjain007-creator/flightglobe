import { useState, useCallback, useEffect } from "react";

const PASSPORT_KEY = "flightglobe_passport";

export function usePassport() {
  const [stamps, setStamps] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(PASSPORT_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  // Persist to localStorage whenever stamps change
  useEffect(() => {
    localStorage.setItem(PASSPORT_KEY, JSON.stringify(stamps));
  }, [stamps]);

  const addStamp = useCallback((origin, destination, workerResult) => {
    if (!origin || !destination) return;

    const stamp = {
      id: Date.now(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      timestamp: Date.now(),
      origin: { iata: origin.iata, city: origin.city, country: origin.country },
      destination: { iata: destination.iata, city: destination.city, country: destination.country },
      totalKm: workerResult?.totalKm ?? null,
      co2Kg: workerResult?.co2Kg ?? null,
    };

    setStamps((prev) => {
      // Avoid exact duplicate (same route, same hour)
      const isDupe = prev.some(
        (s) =>
          s.origin.iata === stamp.origin.iata &&
          s.destination.iata === stamp.destination.iata &&
          Date.now() - s.timestamp < 3600_000
      );
      if (isDupe) return prev;
      return [stamp, ...prev].slice(0, 50); // keep max 50 stamps
    });
  }, []);

  const removeStamp = useCallback((id) => {
    setStamps((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const clearAll = useCallback(() => setStamps([]), []);

  return { stamps, addStamp, removeStamp, clearAll, isOpen, setIsOpen };
}
