import { isWithinRadius, haversineDistanceMeters } from './geofence';

describe('haversineDistanceMeters', () => {
  it('returns ~0 for identical points', () => {
    const d = haversineDistanceMeters({ lat: 0, lng: 0 }, { lat: 0, lng: 0 });
    expect(d).toBeGreaterThanOrEqual(0);
    expect(d).toBeLessThan(0.001);
  });
});

describe('isWithinRadius', () => {
  const center = { lat: 38.8462, lng: -77.3064 }; // Fairfax-ish

  it('returns inside for point within radius', () => {
    // roughly ~50m north
    const point = { lat: center.lat + 0.00045, lng: center.lng };
    const result = isWithinRadius(center, point, 100);
    expect(result.inside).toBe(true);
    expect(result.distanceMeters).toBeLessThanOrEqual(100);
  });

  it('returns outside for point beyond radius', () => {
    // ~200m north
    const point = { lat: center.lat + 0.0018, lng: center.lng };
    const result = isWithinRadius(center, point, 100);
    expect(result.inside).toBe(false);
    expect(result.distanceMeters).toBeGreaterThan(100);
  });

it('treats exact boundary as inside (within floating point precision)', () => {
  const point = { lat: center.lat + 0.0009, lng: center.lng }; // ~100m
  const result = isWithinRadius(center, point, 100);
  expect(result.distanceMeters).toBeCloseTo(100, 0); // within 1m precision
  
  // Use the ACTUAL computed distance as radius for boundary test
  const boundaryResult = isWithinRadius(center, point, result.distanceMeters);
  expect(boundaryResult.inside).toBe(true);
  expect(boundaryResult.distanceMeters).toBeCloseTo(result.distanceMeters, 0);
});


  it('throws on invalid coordinates', () => {
    expect(() =>
      isWithinRadius({ lat: NaN, lng: 0 }, { lat: 0, lng: 0 }, 100),
    ).toThrow('Invalid coordinates');
  });

  it('throws on negative radius', () => {
    expect(() =>
      isWithinRadius(center, center, -1),
    ).toThrow('Radius must be non-negative');
  });
});
