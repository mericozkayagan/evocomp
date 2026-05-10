// TSP problem domain: cities, distance matrix, tour length.
// Tour is a permutation of city indices [0..n-1] interpreted as a closed loop.

export interface City {
  x: number;
  y: number;
}

export type Tour = number[];

export function distance(a: City, b: City): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function buildDistanceMatrix(cities: City[]): Float64Array {
  const n = cities.length;
  const m = new Float64Array(n * n);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = distance(cities[i], cities[j]);
      m[i * n + j] = d;
      m[j * n + i] = d;
    }
  }
  return m;
}

export function tourLength(tour: Tour, dist: Float64Array, n: number): number {
  let total = 0;
  for (let i = 0; i < n; i++) {
    const a = tour[i];
    const b = tour[(i + 1) % n];
    total += dist[a * n + b];
  }
  return total;
}
