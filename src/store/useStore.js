import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useStore = create(
  persist(
    (set) => ({
      // Route — full Airport objects, persisted so dashboard survives refresh
      waypoints: [],
      theme: "space",
      soundEnabled: true,
      activeOverlayLayer: "none", // "none" | "density" | "weather"

      // Passport stamps (persisted)
      stamps: [],

      // Actions
      setWaypoints: (waypoints) => set({ waypoints }),
      setTheme: (theme) => set({ theme }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setActiveOverlayLayer: (activeOverlayLayer) => set({ activeOverlayLayer }),

      addStamp: (stamp) =>
        set((state) => {
          const isDupe = state.stamps.some(
            (s) =>
              s.origin.iata === stamp.origin.iata &&
              s.destination.iata === stamp.destination.iata &&
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
      name: "flightglobe-v2",
      partialize: (state) => ({
        waypoints: state.waypoints,
        theme: state.theme,
        soundEnabled: state.soundEnabled,
        stamps: state.stamps,
      }),
    }
  )
);
