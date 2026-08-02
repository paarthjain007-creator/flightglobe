import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AIRPORTS } from "../data/airports";

export const useStore = create(
  persist(
    (set) => ({
      // Route & Global Search Sync State
      waypoints: [],
      searchOrigin: AIRPORTS[0],       // Default JFK
      searchDestination: AIRPORTS[1],  // Default LHR
      departureDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      travelClass: "ECONOMY",
      travelers: 1,
      currency: "USD",

      // UI Themes & Preferences
      theme: "space",
      soundEnabled: true,
      activeOverlayLayer: "none", // "none" | "density" | "weather"
      cinematicMode: false,

      // Passport stamps
      stamps: [],

      // Actions
      setWaypoints: (waypoints) => set({ waypoints }),
      setSearchOrigin: (searchOrigin) => set({ searchOrigin }),
      setSearchDestination: (searchDestination) => set({ searchDestination }),
      setDepartureDate: (departureDate) => set({ departureDate }),
      setTravelClass: (travelClass) => set({ travelClass }),
      setTravelers: (travelers) => set({ travelers }),
      setCurrency: (currency) => set({ currency }),
      setTheme: (theme) => set({ theme }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setActiveOverlayLayer: (activeOverlayLayer) => set({ activeOverlayLayer }),
      setCinematicMode: (cinematicMode) => set({ cinematicMode }),

      addStamp: (stamp) =>
        set((state) => {
          const isDupe = state.stamps.some(
            (s) =>
              s.origin?.iata === stamp.origin?.iata &&
              s.destination?.iata === stamp.destination?.iata &&
              Date.now() - s.timestamp < 3_600_000
          );
          if (isDupe) return {};
          return { stamps: [stamp, ...state.stamps].slice(0, 50) };
        }),

      removeStamp: (id) =>
        set((state) => ({ stamps: state.stamps.filter((s) => s.id !== id) })),

      clearStamps: () => set({ stamps: [] }),
    }),
    {
      name: "flightglobe-v3",
      partialize: (state) => ({
        waypoints: state.waypoints,
        searchOrigin: state.searchOrigin,
        searchDestination: state.searchDestination,
        departureDate: state.departureDate,
        travelClass: state.travelClass,
        currency: state.currency,
        theme: state.theme,
        soundEnabled: state.soundEnabled,
        stamps: state.stamps,
      }),
    }
  )
);
