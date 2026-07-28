/**
 * Global Jetstream & Wind Vector Math Utility.
 * Generates global atmospheric wind vectors and calculates headwind/tailwind impact on flight paths.
 */

/**
 * Generates curved 3D Jetstream wind vector paths across global latitudes
 */
export function generateJetstreamPaths() {
  const paths = [];

  // Major global jetstream latitudinal bands
  const bands = [
    { latBase: 48, alt: 0.12, color: "rgba(56, 189, 248, 0.4)" },  // Northern Polar Jetstream
    { latBase: 30, alt: 0.14, color: "rgba(168, 85, 247, 0.45)" }, // Northern Subtropical Jetstream
    { latBase: -32, alt: 0.13, color: "rgba(56, 189, 248, 0.4)" }, // Southern Subtropical Jetstream
  ];

  bands.forEach((band, bandIdx) => {
    // Generate 4 flowing west-to-east wave segments per band
    for (let seg = 0; seg < 4; seg++) {
      const startLng = -180 + seg * 90;
      const points = [];

      for (let step = 0; step <= 25; step++) {
        const progress = step / 25;
        const lng = startLng + progress * 90;
        // Sine wave oscillation simulating atmospheric jetstream meander
        const lat = band.latBase + Math.sin(progress * Math.PI * 2 + bandIdx) * 6;

        points.push({ lat, lng, alt: band.alt });
      }

      paths.push({
        coords: points,
        color: band.color,
        stroke: 1.2,
      });
    }
  });

  return paths;
}

/**
 * Calculates headwind vs tailwind direction relative to global West-to-East jetstream
 */
export function calculateWindEffect(origin, destination) {
  if (!origin || !destination) {
    return { type: "neutral", magnitudeKmh: 0, arcColorTint: "#60a5fa", timeImpactMinutes: 0 };
  }

  const dLng = destination.lng - origin.lng;
  // Normalized longitude delta (-180 to 180)
  const normalizedDLng = ((dLng + 540) % 360) - 180;

  if (normalizedDLng > 15) {
    // Flying Eastbound -> Tailwind Boost from West-to-East Jetstream
    const speedBoost = Math.round(45 + Math.random() * 35); // +45-80 km/h tailwind
    return {
      type: "tailwind",
      magnitudeKmh: speedBoost,
      label: `Tailwind Boost (+${speedBoost} km/h)`,
      arcColorTint: "#4ade80", // Bright Green
      timeImpactMinutes: -Math.round(speedBoost * 0.3),
    };
  } else if (normalizedDLng < -15) {
    // Flying Westbound -> Headwind Resistance against Jetstream
    const speedDrag = Math.round(50 + Math.random() * 30); // -50-80 km/h headwind
    return {
      type: "headwind",
      magnitudeKmh: speedDrag,
      label: `Headwind Drag (-${speedDrag} km/h)`,
      arcColorTint: "#f87171", // Red / Amber
      timeImpactMinutes: +Math.round(speedDrag * 0.35),
    };
  }

  return {
    type: "crosswind",
    magnitudeKmh: 20,
    label: "Crosswind Neutral",
    arcColorTint: "#60a5fa",
    timeImpactMinutes: 0,
  };
}
