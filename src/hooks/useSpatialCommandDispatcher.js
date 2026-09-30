/**
 * useSpatialCommandDispatcher
 *
 * React hook that receives parsed spatial command objects from the engine
 * and dispatches them as real side-effects: globe camera moves, overlay
 * layer toggles, navigation events, waypoint draws, and AR sessions.
 *
 * Returns: { dispatch, lastCommand, commandHistory }
 */

import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { SPATIAL_COMMANDS } from "../services/spatialCommandEngine";

export function useSpatialCommandDispatcher() {
  const navigate = useNavigate();

  // Zustand global dispatchers
  const setWaypoints         = useStore((s) => s.setWaypoints);
  const setSearchOrigin      = useStore((s) => s.setSearchOrigin);
  const setSearchDestination = useStore((s) => s.setSearchDestination);
  const setActiveOverlayLayer= useStore((s) => s.setActiveOverlayLayer);
  const setSpatialCommand    = useStore((s) => s.setSpatialCommand);
  const setGlobeFocusTarget  = useStore((s) => s.setGlobeFocusTarget);
  const setTheme             = useStore((s) => s.setTheme);
  const setCurrency          = useStore((s) => s.setCurrency);
  const setDepartureDate     = useStore((s) => s.setDepartureDate);

  const [lastCommand, setLastCommand]       = useState(null);
  const [commandHistory, setCommandHistory] = useState([]);

  /**
   * dispatch(spatialCommand)
   *
   * The primary entry point. Accepts an object shaped as:
   *   { action, params, flight_context, confidence }
   *
   * Returns a result object:
   *   { success, message, navigated }
   */
  const dispatch = useCallback(
    async (cmd) => {
      if (!cmd || !cmd.action) return { success: false, message: "No command provided." };

      const { action, params = {} } = cmd;
      const result = { success: true, message: "", navigated: false };

      // ── Persist to store + local history ─────────────────────────────────
      setSpatialCommand(cmd);
      setLastCommand(cmd);
      setCommandHistory((prev) => [cmd, ...prev].slice(0, 50));

      // ── Execute side-effects ──────────────────────────────────────────────
      switch (action) {

        // ─ INITIALIZE_GLOBE ────────────────────────────────────────────────
        case SPATIAL_COMMANDS.INITIALIZE_GLOBE: {
          setActiveOverlayLayer("none");
          setWaypoints([]);
          setGlobeFocusTarget({ lat: params.centerLat ?? 20, lng: params.centerLng ?? 0, altitude: params.zoom ?? 2.5 });
          navigate("/explore");
          result.message = "Globe initialized at global view.";
          result.navigated = true;
          break;
        }

        // ─ FOCUS_LOCATION ──────────────────────────────────────────────────
        case SPATIAL_COMMANDS.FOCUS_LOCATION: {
          if (params.lat != null && params.lng != null) {
            setGlobeFocusTarget({
              lat: params.lat,
              lng: params.lng,
              altitude: params.zoom ?? 1.5,
            });
            navigate("/explore");
            result.message = `Camera moved to ${params.city ?? params.iata ?? "location"}.`;
            result.navigated = true;
          } else {
            result.success = false;
            result.message = "Could not resolve location coordinates.";
          }
          break;
        }

        // ─ DRAW_ROUTE ──────────────────────────────────────────────────────
        case SPATIAL_COMMANDS.DRAW_ROUTE: {
          const { origin, dest } = params;
          if (origin && dest) {
            setSearchOrigin(origin);
            setSearchDestination(dest);
            setWaypoints([origin, dest]);
            // Focus globe between the two points
            const midLat = (origin.lat + dest.lat) / 2;
            const midLng = (origin.lng + dest.lng) / 2;
            setGlobeFocusTarget({ lat: midLat, lng: midLng, altitude: 2.2 });
            navigate("/explore");
            result.message = `Route drawn: ${origin.iata} → ${dest.iata}.`;
            result.navigated = true;
          } else {
            result.success = false;
            result.message = "Could not resolve origin or destination airports.";
          }
          break;
        }

        // ─ FILTER_HEATMAP ──────────────────────────────────────────────────
        case SPATIAL_COMMANDS.FILTER_HEATMAP: {
          const layer = params.layer ?? "density";
          setActiveOverlayLayer(layer);
          // Stay on current page — globe will reactively show the layer
          result.message = `Overlay layer "${layer.replace(/_/g, " ")}" applied to globe.`;
          break;
        }

        // ─ SHOW_AIRCRAFT_AR ────────────────────────────────────────────────
        case SPATIAL_COMMANDS.SHOW_AIRCRAFT_AR: {
          setActiveOverlayLayer("aircraft_ar");
          navigate("/explore");
          result.message = "Live aircraft AR pins activated on globe.";
          result.navigated = true;
          break;
        }

        // ─ TRIGGER_AR_MODE ─────────────────────────────────────────────────
        case SPATIAL_COMMANDS.TRIGGER_AR_MODE: {
          // Signal Explore page to open AR modal via store
          setSpatialCommand({ ...cmd, _arTrigger: true });
          navigate("/explore");
          result.message = "AR / WebXR session launcher activated.";
          result.navigated = true;
          break;
        }

        // ─ TRIGGER_COCKPIT_VIEW ────────────────────────────────────────────
        case SPATIAL_COMMANDS.TRIGGER_COCKPIT_VIEW: {
          setSpatialCommand({ ...cmd, _cockpitTrigger: true });
          navigate("/explore");
          result.message = "First-Person Cockpit View activated.";
          result.navigated = true;
          break;
        }

        // ─ TOGGLE_JETSTREAM ────────────────────────────────────────────────
        case SPATIAL_COMMANDS.TOGGLE_JETSTREAM: {
          setSpatialCommand({ ...cmd, _jetstreamTrigger: true });
          navigate("/explore");
          result.message = params.enabled === false ? "Jetstream wind streams hidden." : "Global Jetstream winds activated.";
          result.navigated = true;
          break;
        }

        // ─ Legacy non-spatial actions ──────────────────────────────────────
        case SPATIAL_COMMANDS.SHOW_RADAR: {
          navigate("/radar");
          result.message = "Opening Live Air Traffic Radar.";
          result.navigated = true;
          break;
        }

        case SPATIAL_COMMANDS.SHOW_DASHBOARD: {
          navigate("/passport");
          result.message = "Opening Trip Telemetry Dashboard.";
          result.navigated = true;
          break;
        }

        case SPATIAL_COMMANDS.CHANGE_THEME: {
          if (params.theme) setTheme(params.theme);
          result.message = `Theme switched to ${params.theme}.`;
          break;
        }

        case SPATIAL_COMMANDS.CHANGE_CURRENCY: {
          if (params.currency) setCurrency(params.currency);
          navigate("/booking");
          result.message = `Currency updated to ${params.currency}.`;
          result.navigated = true;
          break;
        }

        case SPATIAL_COMMANDS.SEARCH_FLIGHTS: {
          const { origin, dest } = params;
          if (origin) setSearchOrigin(origin);
          if (dest) setSearchDestination(dest);
          if (origin && dest) setWaypoints([origin, dest]);
          navigate("/booking");
          result.message = `Searching flights to ${dest?.city ?? "destination"}.`;
          result.navigated = true;
          break;
        }

        default: {
          result.success = false;
          result.message = "I couldn't map that to a specific spatial action. Try describing a city, route, or overlay.";
        }
      }

      return result;
    },
    [navigate, setWaypoints, setSearchOrigin, setSearchDestination, setActiveOverlayLayer,
     setSpatialCommand, setGlobeFocusTarget, setTheme, setCurrency, setDepartureDate]
  );

  return { dispatch, lastCommand, commandHistory };
}
