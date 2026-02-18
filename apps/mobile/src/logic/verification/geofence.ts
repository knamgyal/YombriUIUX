export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeofenceResult {
  inside: boolean;
  distanceMeters: number;
}

const EARTH_RADIUS_M = 6_371_000;

export function haversineDistanceMeters(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return EARTH_RADIUS_M * c;
}

export function isWithinRadius(
  center: GeoPoint,
  point: GeoPoint,
  radiusMeters: number,
): GeofenceResult {
  if (!isFinite(center.lat) || !isFinite(center.lng) ||
      !isFinite(point.lat) || !isFinite(point.lng)) {
    throw new Error('Invalid coordinates');
  }
  if (radiusMeters < 0) {
    throw new Error('Radius must be non-negative');
  }

  const distance = haversineDistanceMeters(center, point);
  return {
    inside: distance <= radiusMeters,
    distanceMeters: distance,
  };
}
