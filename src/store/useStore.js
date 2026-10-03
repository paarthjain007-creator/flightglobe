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
      isLiteMode: typeof window !== "undefined" ? window.innerWidth < 768 : false,
      theme: "space",
      soundEnabled: true,
      soundVolume: 1.0,          // 0 | 0.5 | 1.0 — three level volume
      trafficDensity: "LOW",     // "LOW" | "MEDIUM" | "MATRIX"
      showDayNight: false,       // Day/Night terminator toggle
      activeOverlayLayer: "none",
      cinematicMode: false,
      multiplayerRoom: null,     // null | "ROOM-XXXXXX"
      atcRadioEnabled: false,    // ATC Radio audio loop
      atcRadioFrequency: "118.700", // Default JFK Tower
      emergencyAlert: null,      // Active Squawk 7700/7600 event or null

      // Passport stamps
      stamps: [
        {
          id: "7041",
          timestamp: Date.now() - 86400000 * 2,
          date: "2026-09-02",
          origin: { iata: "JFK", code: "JFK", city: "New York", country: "United States", lat: 40.6413, lng: -73.7781, lon: -73.7781 },
          destination: { iata: "LHR", code: "LHR", city: "London", country: "United Kingdom", lat: 51.47, lng: -0.4543, lon: -0.4543 },
          flightCode: "AA-1416",
        },
        {
          id: "9218",
          timestamp: Date.now() - 86400000 * 5,
          date: "2026-08-30",
          origin: { iata: "DEL", code: "DEL", city: "New Delhi", country: "India", lat: 28.5562, lng: 77.1, lon: 77.1 },
          destination: { iata: "DXB", code: "DXB", city: "Dubai", country: "United Arab Emirates", lat: 25.2532, lng: 55.3657, lon: 55.3657 },
          flightCode: "EK-511",
        }
      ],

      // Saved Trips & Boarding Passes
      trips: [
        {
          id: "T-8842",
          flight: {
            code: "AI-805",
            airline: "Air India",
            from: "DEL",
            to: "LHR",
            dep: "09:45",
            arr: "11:55",
            dur: "8h 40m",
            plane: "Boeing 787-9 Dreamliner",
            price: 520,
          },
          origin: { iata: "DEL", code: "DEL", city: "New Delhi", country: "India", lat: 28.5562, lng: 77.1, lon: 77.1 },
          destination: { iata: "LHR", code: "LHR", city: "London", country: "United Kingdom", lat: 51.47, lng: -0.4543, lon: -0.4543 },
          totalPrice: 520,
          currency: "USD",
          currencySymbol: "$",
          seat: "2B",
          gate: "B14",
          terminal: "T3",
          group: "A (Priority)",
          bookingRef: "FG-847291",
          date: "2026-09-20",
        }
      ],

      // UI Interactivity
      hoveredFlightPath: null,

      // Spatial Command Protocol
      lastSpatialCommand: null,   // { action, params, flight_context, confidence }
      commandHistory: [],          // Rolling log of last 50 commands
      globeFocusTarget: null,      // { lat, lng, altitude } — triggers globe camera pan

      // Actions
      setWaypoints: (waypoints) => set({ waypoints }),
      setSearchOrigin: (searchOrigin) => set({ searchOrigin }),
      setSearchDestination: (searchDestination) => set({ searchDestination }),
      setDepartureDate: (departureDate) => set({ departureDate }),
      setTravelClass: (travelClass) => set({ travelClass }),
      setTravelers: (travelers) => set({ travelers }),
      setCurrency: (currency) => set({ currency }),
      setTheme: (theme) => set({ theme }),
      setIsLiteMode: (isLiteMode) => set({ isLiteMode }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setSoundVolume: (soundVolume) => set({ soundVolume }),
      setTrafficDensity: (trafficDensity) => set({ trafficDensity }),
      setShowDayNight: (showDayNight) => set({ showDayNight }),
      setMultiplayerRoom: (multiplayerRoom) => set({ multiplayerRoom }),
      setActiveOverlayLayer: (activeOverlayLayer) => set({ activeOverlayLayer }),
      setCinematicMode: (cinematicMode) => set({ cinematicMode }),
      setHoveredFlightPath: (hoveredFlightPath) => set({ hoveredFlightPath }),
      setAtcRadioEnabled: (atcRadioEnabled) => set({ atcRadioEnabled }),
      setAtcRadioFrequency: (atcRadioFrequency) => set({ atcRadioFrequency }),
      setEmergencyAlert: (emergencyAlert) => set({ emergencyAlert }),

      // Trip actions
      addTrip: (trip) => set((state) => ({ trips: [trip, ...state.trips] })),
      removeTrip: (id) => set((state) => ({ trips: state.trips.filter((t) => t.id !== id) })),
      setTrips: (trips) => set({ trips }),

      // Spatial Command Protocol actions
      setSpatialCommand: (cmd) =>
        set((state) => ({
          lastSpatialCommand: cmd,
          commandHistory: [cmd, ...state.commandHistory].slice(0, 50),
        })),
      setGlobeFocusTarget: (globeFocusTarget) => set({ globeFocusTarget }),
      clearCommandHistory: () => set({ commandHistory: [], lastSpatialCommand: null }),

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
        isLiteMode: state.isLiteMode,
        soundEnabled: state.soundEnabled,
        stamps: state.stamps,
        trips: state.trips,
      }),
    }
  )
);
