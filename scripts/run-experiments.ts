// Headless experiment runner: produces the numbers that fill Tables I-V of
// the IEEE report. Run with: `npx tsx scripts/run-experiments.ts`.
//
// Output: writes JSON + CSV to ./report/data/.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { GAConfig } from "../lib/ga";
import { runExperiment, toCSV, ExperimentRow } from "../lib/experiments";
import { INSTANCES } from "../lib/tsplib";

const BASE: GAConfig = {
  numCities: 0,
  populationSize: 200,
  generations: 500,
  mutationRate: 0.2,
  crossoverRate: 0.9,
  elitism: 4,
  selection: "tournament",
  tournamentSize: 5,
  crossover: "ox1",
  mutation: "inversion",
  seed: 0,
};

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface Suite {
  key: string;
  label: string;
  variants: { label: string; overrides: Partial<GAConfig> }[];
}

const SUITES: Suite[] = [
  {
    key: "mutation_op",
    label: "Mutation operator",
    variants: [
      { label: "swap", overrides: { mutation: "swap" } },
      { label: "inversion", overrides: { mutation: "inversion" } },
      { label: "scramble", overrides: { mutation: "scramble" } },
    ],
  },
  {
    key: "crossover_op",
    label: "Crossover operator",
    variants: [
      { label: "ox1", overrides: { crossover: "ox1" } },
      { label: "pmx", overrides: { crossover: "pmx" } },
    ],
  },
  {
    key: "selection_method",
    label: "Selection method",
    variants: [
      {
        label: "tournament_k=5",
        overrides: { selection: "tournament", tournamentSize: 5 },
      },
      {
        label: "tournament_k=2",
        overrides: { selection: "tournament", tournamentSize: 2 },
      },
      { label: "roulette", overrides: { selection: "roulette" } },
      { label: "rank", overrides: { selection: "rank" } },
    ],
  },
  {
    key: "mutation_rate",
    label: "Mutation rate",
    variants: [
      { label: "0.05", overrides: { mutationRate: 0.05 } },
      { label: "0.10", overrides: { mutationRate: 0.1 } },
      { label: "0.20", overrides: { mutationRate: 0.2 } },
      { label: "0.40", overrides: { mutationRate: 0.4 } },
      { label: "0.80", overrides: { mutationRate: 0.8 } },
    ],
  },
  {
    key: "population_size",
    label: "Population size",
    variants: [
      { label: "50", overrides: { populationSize: 50 } },
      { label: "100", overrides: { populationSize: 100 } },
      { label: "200", overrides: { populationSize: 200 } },
      { label: "400", overrides: { populationSize: 400 } },
    ],
  },
  {
    key: "elitism",
    label: "Elitism",
    variants: [
      { label: "0", overrides: { elitism: 0 } },
      { label: "2", overrides: { elitism: 2 } },
      { label: "4", overrides: { elitism: 4 } },
      { label: "10", overrides: { elitism: 10 } },
    ],
  },
];

const OUT_DIR = join(process.cwd(), "report", "data");
mkdirSync(OUT_DIR, { recursive: true });

const t0 = Date.now();
const allResults: Record<string, Record<string, ExperimentRow[]>> = {};

for (const instanceKey of ["berlin52", "eil51"] as const) {
  console.log(`\n=== Instance: ${instanceKey} ===`);
  allResults[instanceKey] = {};
  for (const suite of SUITES) {
    const t1 = Date.now();
    const rows = runExperiment({
      instance: INSTANCES[instanceKey],
      base: BASE,
      variants: suite.variants,
      seeds: SEEDS,
    });
    allResults[instanceKey][suite.key] = rows;
    const csv = toCSV(rows);
    writeFileSync(join(OUT_DIR, `${suite.key}_${instanceKey}.csv`), csv);
    const dt = ((Date.now() - t1) / 1000).toFixed(1);
    console.log(`  ${suite.label.padEnd(28)} done in ${dt}s`);
    for (const r of rows) {
      console.log(
        `    ${r.label.padEnd(20)} mean=${r.meanBest.toFixed(2)} std=${r.stdBest.toFixed(
          2,
        )} gap=${r.meanGap.toFixed(2)}%`,
      );
    }
  }
}

writeFileSync(
  join(OUT_DIR, "all_results.json"),
  JSON.stringify(allResults, null, 2),
);
const total = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\nWrote results to ${OUT_DIR}; total ${total}s`);
