// Batch experiments: run the GA across configurations and seeds, then
// aggregate (mean, std, gap-from-optimum). The IEEE report's Experimental
// Work section pulls its tables from these results.

import { GAConfig, runGA } from "./ga";
import { mulberry32 } from "./rng";
import { buildDistanceMatrix } from "./tsp";
import { TSPInstance } from "./tsplib";

export interface ExperimentRow {
  label: string;
  config: Partial<GAConfig>;
  bestLengths: number[];
  meanBest: number;
  stdBest: number;
  meanGap: number;
  meanFinalGen: number;
}

export interface ExperimentInput {
  instance: TSPInstance;
  base: GAConfig;
  variants: { label: string; overrides: Partial<GAConfig> }[];
  seeds: number[];
}

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function std(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(
    xs.reduce((acc, x) => acc + (x - m) ** 2, 0) / (xs.length - 1),
  );
}

export function runExperiment(input: ExperimentInput): ExperimentRow[] {
  const { instance, base, variants, seeds } = input;
  const dist = buildDistanceMatrix(instance.cities);
  const optimal = instance.optimal;
  const rows: ExperimentRow[] = [];

  for (const v of variants) {
    const cfg: GAConfig = {
      ...base,
      ...v.overrides,
      numCities: instance.cities.length,
    };
    const lengths: number[] = [];
    const finalGens: number[] = [];
    for (const seed of seeds) {
      const result = runGA({ ...cfg, seed }, dist, mulberry32(seed));
      lengths.push(result.bestLength);
      finalGens.push(result.history[result.history.length - 1].generation);
    }
    const m = mean(lengths);
    const gaps = optimal > 0 ? lengths.map((l) => ((l - optimal) / optimal) * 100) : [];
    rows.push({
      label: v.label,
      config: v.overrides,
      bestLengths: lengths,
      meanBest: m,
      stdBest: std(lengths),
      meanGap: optimal > 0 ? mean(gaps) : 0,
      meanFinalGen: mean(finalGens),
    });
  }
  return rows;
}

export function toCSV(rows: ExperimentRow[]): string {
  const header = [
    "variant",
    "mean_best",
    "std_best",
    "mean_gap_pct",
    "mean_final_generation",
    "individual_runs",
  ].join(",");
  const lines = rows.map((r) =>
    [
      JSON.stringify(r.label),
      r.meanBest.toFixed(2),
      r.stdBest.toFixed(2),
      r.meanGap.toFixed(2),
      r.meanFinalGen.toFixed(0),
      JSON.stringify(r.bestLengths.map((x) => Number(x.toFixed(2)))),
    ].join(","),
  );
  return [header, ...lines].join("\n");
}
