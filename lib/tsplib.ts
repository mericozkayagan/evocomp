// TSPLIB benchmark instances. Coordinates from the public TSPLIB95 archive
// (berlin52, eil51) — used as standard, peer-reviewed test problems so our
// results are comparable with the literature surveyed in the report.

import { City } from "./tsp";
import { Rng, randInt } from "./rng";

export interface TSPInstance {
  name: string;
  cities: City[];
  optimal: number; // known optimum (or best known) tour length
  description: string;
}

const BERLIN52: City[] = [
  { x: 565.0, y: 575.0 },
  { x: 25.0, y: 185.0 },
  { x: 345.0, y: 750.0 },
  { x: 945.0, y: 685.0 },
  { x: 845.0, y: 655.0 },
  { x: 880.0, y: 660.0 },
  { x: 25.0, y: 230.0 },
  { x: 525.0, y: 1000.0 },
  { x: 580.0, y: 1175.0 },
  { x: 650.0, y: 1130.0 },
  { x: 1605.0, y: 620.0 },
  { x: 1220.0, y: 580.0 },
  { x: 1465.0, y: 200.0 },
  { x: 1530.0, y: 5.0 },
  { x: 845.0, y: 680.0 },
  { x: 725.0, y: 370.0 },
  { x: 145.0, y: 665.0 },
  { x: 415.0, y: 635.0 },
  { x: 510.0, y: 875.0 },
  { x: 560.0, y: 365.0 },
  { x: 300.0, y: 465.0 },
  { x: 520.0, y: 585.0 },
  { x: 480.0, y: 415.0 },
  { x: 835.0, y: 625.0 },
  { x: 975.0, y: 580.0 },
  { x: 1215.0, y: 245.0 },
  { x: 1320.0, y: 315.0 },
  { x: 1250.0, y: 400.0 },
  { x: 660.0, y: 180.0 },
  { x: 410.0, y: 250.0 },
  { x: 420.0, y: 555.0 },
  { x: 575.0, y: 665.0 },
  { x: 1150.0, y: 1160.0 },
  { x: 700.0, y: 580.0 },
  { x: 685.0, y: 595.0 },
  { x: 685.0, y: 610.0 },
  { x: 770.0, y: 610.0 },
  { x: 795.0, y: 645.0 },
  { x: 720.0, y: 635.0 },
  { x: 760.0, y: 650.0 },
  { x: 475.0, y: 960.0 },
  { x: 95.0, y: 260.0 },
  { x: 875.0, y: 920.0 },
  { x: 700.0, y: 500.0 },
  { x: 555.0, y: 815.0 },
  { x: 830.0, y: 485.0 },
  { x: 1170.0, y: 65.0 },
  { x: 830.0, y: 610.0 },
  { x: 605.0, y: 625.0 },
  { x: 595.0, y: 360.0 },
  { x: 1340.0, y: 725.0 },
  { x: 1740.0, y: 245.0 },
];

const EIL51: City[] = [
  { x: 37, y: 52 },
  { x: 49, y: 49 },
  { x: 52, y: 64 },
  { x: 20, y: 26 },
  { x: 40, y: 30 },
  { x: 21, y: 47 },
  { x: 17, y: 63 },
  { x: 31, y: 62 },
  { x: 52, y: 33 },
  { x: 51, y: 21 },
  { x: 42, y: 41 },
  { x: 31, y: 32 },
  { x: 5, y: 25 },
  { x: 12, y: 42 },
  { x: 36, y: 16 },
  { x: 52, y: 41 },
  { x: 27, y: 23 },
  { x: 17, y: 33 },
  { x: 13, y: 13 },
  { x: 57, y: 58 },
  { x: 62, y: 42 },
  { x: 42, y: 57 },
  { x: 16, y: 57 },
  { x: 8, y: 52 },
  { x: 7, y: 38 },
  { x: 27, y: 68 },
  { x: 30, y: 48 },
  { x: 43, y: 67 },
  { x: 58, y: 48 },
  { x: 58, y: 27 },
  { x: 37, y: 69 },
  { x: 38, y: 46 },
  { x: 46, y: 10 },
  { x: 61, y: 33 },
  { x: 62, y: 63 },
  { x: 63, y: 69 },
  { x: 32, y: 22 },
  { x: 45, y: 35 },
  { x: 59, y: 15 },
  { x: 5, y: 6 },
  { x: 10, y: 17 },
  { x: 21, y: 10 },
  { x: 5, y: 64 },
  { x: 30, y: 15 },
  { x: 39, y: 10 },
  { x: 32, y: 39 },
  { x: 25, y: 32 },
  { x: 25, y: 55 },
  { x: 48, y: 28 },
  { x: 56, y: 37 },
  { x: 30, y: 40 },
];

export const INSTANCES: Record<string, TSPInstance> = {
  berlin52: {
    name: "berlin52",
    cities: BERLIN52,
    optimal: 7542,
    description:
      "52 locations in Berlin — Groetschel, TSPLIB. Optimum tour length: 7542.",
  },
  eil51: {
    name: "eil51",
    cities: EIL51,
    optimal: 426,
    description:
      "51-city problem from Christofides/Eilon, TSPLIB. Optimum tour length: 426.",
  },
};

export function generateRandomInstance(
  n: number,
  rng: Rng,
  bound = 1000,
): TSPInstance {
  const cities: City[] = [];
  for (let i = 0; i < n; i++) {
    cities.push({ x: randInt(rng, 0, bound), y: randInt(rng, 0, bound) });
  }
  return {
    name: `random-${n}`,
    cities,
    optimal: 0,
    description: `${n} random cities in [0,${bound}]^2 — generated for stress testing.`,
  };
}
