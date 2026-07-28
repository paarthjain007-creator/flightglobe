/**
 * Spherical Great-Circle Interpolation (Slerp) & Geographic Heading Utility.
 * Calculates exact lat/lng position along a curved great-circle arc for any progress t in [0, 1].
 */

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/**
 * Spherical interpolation between two lat/lng coordinates.
 * @param {number} lat1 Origin latitude in degrees
 * @param {number} lng1 Origin longitude in degrees
 * @param {number} lat2 Destination latitude in degrees
 * @param {number} lng2 Destination longitude in degrees
 * @param {number} t Progress fraction between 0.0 and 1.0
 */
export function interpolateGreatCircle(lat1, lng1, lat2, lng2, t) {
  if (t <= 0) return { lat: lat1, lng: lng1, heading: 0 };
  if (t >= 1) return { lat: lat2, lng: lng2, heading: 0 };

  const phi1 = lat1 * DEG2RAD;
  const lambda1 = lng1 * DEG2RAD;
  const phi2 = lat2 * DEG2RAD;
  const lambda2 = lng2 * DEG2RAD;

  // Angular distance d between points
  const sinDPhi = Math.sin((phi2 - phi1) / 2);
  const sinDLambda = Math.sin((lambda2 - lambda1) / 2);
  const a = sinDPhi * sinDPhi + Math.cos(phi1) * Math.cos(phi2) * sinDLambda * sinDLambda;
  const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  if (d < 1e-6) {
    return { lat: lat1, lng: lng1, heading: 0 };
  }

  // Great-circle intermediate point formulas (Slerp)
  const A = Math.sin((1 - t) * d) / Math.sin(d);
  const B = Math.sin(t * d) / Math.sin(d);

  const x = A * Math.cos(phi1) * Math.cos(lambda1) + B * Math.cos(phi2) * Math.cos(lambda2);
  const y = A * Math.cos(phi1) * Math.sin(lambda1) + B * Math.cos(phi2) * Math.sin(lambda2);
  const z = A * Math.sin(phi1) + B * Math.sin(phi2);

  const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * RAD2DEG;
  const lng = Math.atan2(y, x) * RAD2DEG;

  // Calculate forward heading / bearing angle in degrees
  const yB = Math.sin(lambda2 - lambda1) * Math.cos(phi2);
  const xB = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1);
  const heading = (Math.atan2(yB, xB) * RAD2DEG + 360) % 360;

  return {
    lat,
    lng,
    heading: Math.round(heading),
  };
}
