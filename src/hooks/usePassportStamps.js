import { useCallback } from "react";

/**
 * PassportStamp interface — mirrors the Zustand stamp shape.
 * @typedef {Object} PassportStamp
 * @property {number} id
 * @property {number} timestamp
 * @property {string} date
 * @property {{ iata: string; city: string; country: string }} origin
 * @property {{ iata: string; city: string; country: string }} destination
 * @property {number} [totalKm]
 * @property {string} [airline]
 * @property {string} [cabinClass]
 * @property {number} [pricePaid]
 * @property {string} [currency]
 * @property {string} [pnr]
 */

const LS_KEY = "flightglobe_passport_stamps";

/**
 * Reads all stamps from localStorage.
 * @returns {PassportStamp[]}
 */
export function readStampsFromLocalStorage() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("[usePassportStamps] Failed to parse localStorage stamps:", err);
    return [];
  }
}

/**
 * Writes stamps array to localStorage safely.
 * @param {PassportStamp[]} stamps
 */
export function writeStampsToLocalStorage(stamps) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(stamps));
  } catch (err) {
    console.warn("[usePassportStamps] localStorage write failed:", err);
  }
}

/**
 * usePassportStamps
 * Custom hook that provides a stable `saveStamp` callback.
 * Appends a new booking entry to the passport_stamps array in localStorage.
 * Also emits a custom DOM event so any subscribed component can reactively update.
 *
 * @param {import('../store/useStore').useStore} addStampToStore - Zustand addStamp action
 * @returns {{ saveStamp: (stamp: PassportStamp) => void }}
 */
export function usePassportStamps(addStampToStore) {
  const saveStamp = useCallback(
    (stamp) => {
      // 1. Append to localStorage (raw persistence)
      const existing = readStampsFromLocalStorage();
      const isDupe = existing.some(
        (s) =>
          s.origin?.iata === stamp.origin?.iata &&
          s.destination?.iata === stamp.destination?.iata &&
          Math.abs(Date.now() - s.timestamp) < 3_600_000
      );
      if (!isDupe) {
        writeStampsToLocalStorage([stamp, ...existing].slice(0, 50));
        // 2. Emit a custom event so the Passport page can re-render if mounted
        window.dispatchEvent(new CustomEvent("passport:stamp-added", { detail: stamp }));
      }

      // 3. Also sync to Zustand store (persisted via zustand/middleware)
      if (addStampToStore) {
        addStampToStore(stamp);
      }
    },
    [addStampToStore]
  );

  return { saveStamp };
}
