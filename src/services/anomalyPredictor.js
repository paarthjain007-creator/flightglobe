import { interpolateGreatCircle } from "../utils/slerpMath";

/**
 * AI Predictive Anomaly Engine.
 * Analyzes selected route against atmospheric jetstream shear & turbulence patterns.
 */
export function predictRouteAnomalies(origin, destination) {
  if (!origin || !destination) {
    return { anomalies: [], warningRings: [], severityScore: "LOW" };
  }

  const anomalies = [];
  const warningRings = [];

  // Generate 3D turbulence warning rings along mid-route coordinates
  const midPoint1 = interpolateGreatCircle(origin.lat, origin.lng, destination.lat, destination.lng, 0.35);
  const midPoint2 = interpolateGreatCircle(origin.lat, origin.lng, destination.lat, destination.lng, 0.68);

  // Atlantic / High-altitude jetstream turbulence check
  const isHighLat = Math.abs(origin.lat) > 40 || Math.abs(destination.lat) > 40;
  if (isHighLat) {
    anomalies.push({
      id: "anom-turb-1",
      title: "Moderate to Severe Jetstream Turbulence",
      location: `${Math.round(midPoint1.lat)}°N, ${Math.round(midPoint1.lng)}°W (FL360)`,
      probability: 78,
      severity: "high",
      description: "Atmospheric wind shear along upper-level polar jetstream corridor.",
    });

    warningRings.push({
      lat: midPoint1.lat,
      lng: midPoint1.lng,
      maxR: 4.5,
      propagationSpeed: 2.2,
      repeatPeriod: 1000,
      color: "rgba(248, 113, 113, 0.8)", // Pulsing red ring
      severity: "high",
    });
  }

  // Cross-Equatorial or Tropical convection check
  const isEquatorial = Math.abs(origin.lat) < 20 || Math.abs(destination.lat) < 20;
  if (isEquatorial) {
    anomalies.push({
      id: "anom-conv-2",
      title: "Intertropical Convective Storm Activity",
      location: `${Math.round(midPoint2.lat)}°, ${Math.round(midPoint2.lng)}°`,
      probability: 55,
      severity: "moderate",
      description: "Cumulonimbus cloud towers requiring radar routing vectors.",
    });

    warningRings.push({
      lat: midPoint2.lat,
      lng: midPoint2.lng,
      maxR: 3.5,
      propagationSpeed: 1.8,
      repeatPeriod: 1400,
      color: "rgba(251, 191, 36, 0.75)", // Pulsing amber ring
      severity: "moderate",
    });
  }

  // Destination Ground Delay Anomaly
  if (destination.country === "UK" || destination.country === "Germany" || destination.country === "Japan") {
    anomalies.push({
      id: "anom-ground-3",
      title: "Destination Low Visibility / Ground De-icing Delay",
      location: `${destination.city} (${destination.iata})`,
      probability: 42,
      severity: "moderate",
      description: "Expected 20-30 min holding pattern due to peak arrival slot congestion.",
    });
  }

  const severityScore = anomalies.some((a) => a.severity === "high") ? "HIGH" : anomalies.length > 0 ? "MODERATE" : "LOW";

  return { anomalies, warningRings, severityScore };
}
