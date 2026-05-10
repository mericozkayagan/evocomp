"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CrossoverMethod,
  GAConfig,
  MutationMethod,
  SelectionMethod,
} from "@/lib/ga";
import { ExperimentRow, runExperiment, toCSV } from "@/lib/experiments";
import { INSTANCES } from "@/lib/tsplib";

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

const SEEDS = [1, 2, 3, 4, 5];

interface Suite {
  key: string;
  label: string;
  variants: { label: string; overrides: Partial<GAConfig> }[];
}

const SUITES: Suite[] = [
  {
    key: "mutation_op",
    label: "Mutation operator (swap vs inversion vs scramble)",
    variants: [
      { label: "swap", overrides: { mutation: "swap" as MutationMethod } },
      {
        label: "inversion",
        overrides: { mutation: "inversion" as MutationMethod },
      },
      {
        label: "scramble",
        overrides: { mutation: "scramble" as MutationMethod },
      },
    ],
  },
  {
    key: "crossover_op",
    label: "Crossover operator (OX1 vs PMX)",
    variants: [
      { label: "ox1", overrides: { crossover: "ox1" as CrossoverMethod } },
      { label: "pmx", overrides: { crossover: "pmx" as CrossoverMethod } },
    ],
  },
  {
    key: "selection_method",
    label: "Selection method",
    variants: [
      {
        label: "tournament k=5",
        overrides: {
          selection: "tournament" as SelectionMethod,
          tournamentSize: 5,
        },
      },
      {
        label: "tournament k=2",
        overrides: {
          selection: "tournament" as SelectionMethod,
          tournamentSize: 2,
        },
      },
      {
        label: "roulette",
        overrides: { selection: "roulette" as SelectionMethod },
      },
      { label: "rank", overrides: { selection: "rank" as SelectionMethod } },
    ],
  },
  {
    key: "mutation_rate",
    label: "Mutation rate sweep",
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
    label: "Population size sweep",
    variants: [
      { label: "50", overrides: { populationSize: 50 } },
      { label: "100", overrides: { populationSize: 100 } },
      { label: "200", overrides: { populationSize: 200 } },
      { label: "400", overrides: { populationSize: 400 } },
    ],
  },
  {
    key: "elitism",
    label: "Elitism sweep",
    variants: [
      { label: "0", overrides: { elitism: 0 } },
      { label: "2", overrides: { elitism: 2 } },
      { label: "4", overrides: { elitism: 4 } },
      { label: "10", overrides: { elitism: 10 } },
    ],
  },
];

type InstanceKey = "berlin52" | "eil51";

export default function Experiments() {
  const [instanceKey, setInstanceKey] = useState<InstanceKey>("berlin52");
  const [results, setResults] = useState<Record<string, ExperimentRow[]>>({});
  const [busySuite, setBusySuite] = useState<string | null>(null);

  const runSuite = (suite: Suite) => {
    setBusySuite(suite.key);
    // Run synchronously inside setTimeout to let the UI update the spinner.
    setTimeout(() => {
      const rows = runExperiment({
        instance: INSTANCES[instanceKey],
        base: BASE,
        variants: suite.variants,
        seeds: SEEDS,
      });
      setResults((r) => ({ ...r, [suite.key]: rows }));
      setBusySuite(null);
    }, 50);
  };

  const runAll = () => {
    setBusySuite("all");
    setTimeout(() => {
      const all: Record<string, ExperimentRow[]> = {};
      for (const suite of SUITES) {
        all[suite.key] = runExperiment({
          instance: INSTANCES[instanceKey],
          base: BASE,
          variants: suite.variants,
          seeds: SEEDS,
        });
      }
      setResults(all);
      setBusySuite(null);
    }, 50);
  };

  const downloadCSV = (suiteKey: string) => {
    const rows = results[suiteKey];
    if (!rows) return;
    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${suiteKey}_${instanceKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full bg-zinc-50 px-6 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Experiments
          </h1>
          <Link
            href="/"
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            data-testid="nav-home"
          >
            ← Live demo
          </Link>
        </header>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Each suite runs the GA for {BASE.generations} generations on the
          selected instance, repeated over {SEEDS.length} random seeds. Mean
          best length, standard deviation, and gap from the known optimum are
          reported.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <span>Instance</span>
            <select
              value={instanceKey}
              onChange={(e) => setInstanceKey(e.target.value as InstanceKey)}
              className="rounded-md border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
              data-testid="exp-select-instance"
            >
              <option value="berlin52">berlin52 (opt 7542)</option>
              <option value="eil51">eil51 (opt 426)</option>
            </select>
          </label>
          <button
            type="button"
            onClick={runAll}
            disabled={busySuite !== null}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            data-testid="exp-run-all"
          >
            {busySuite === "all" ? "Running…" : "Run all suites"}
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {SUITES.map((suite) => (
            <section
              key={suite.key}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              data-testid={`suite-${suite.key}`}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold">{suite.label}</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => runSuite(suite)}
                    disabled={busySuite !== null}
                    className="rounded-md bg-zinc-900 px-3 py-1 text-xs font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                    data-testid={`run-${suite.key}`}
                  >
                    {busySuite === suite.key ? "Running…" : "Run"}
                  </button>
                  {results[suite.key] && (
                    <button
                      type="button"
                      onClick={() => downloadCSV(suite.key)}
                      className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium dark:border-zinc-700"
                      data-testid={`csv-${suite.key}`}
                    >
                      Download CSV
                    </button>
                  )}
                </div>
              </div>
              {results[suite.key] && (
                <table className="mt-3 w-full text-sm">
                  <thead>
                    <tr className="text-left text-zinc-500">
                      <th className="py-1 font-medium">Variant</th>
                      <th className="py-1 text-right font-medium">Mean best</th>
                      <th className="py-1 text-right font-medium">Std</th>
                      <th className="py-1 text-right font-medium">Gap (%)</th>
                      <th className="py-1 text-right font-medium">Runs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results[suite.key].map((row) => (
                      <tr key={row.label} className="border-t border-zinc-100 dark:border-zinc-800">
                        <td className="py-1.5 font-mono">{row.label}</td>
                        <td className="py-1.5 text-right font-mono">
                          {row.meanBest.toFixed(2)}
                        </td>
                        <td className="py-1.5 text-right font-mono">
                          {row.stdBest.toFixed(2)}
                        </td>
                        <td className="py-1.5 text-right font-mono">
                          {row.meanGap.toFixed(2)}
                        </td>
                        <td className="py-1.5 text-right font-mono text-zinc-500">
                          {row.bestLengths
                            .map((x) => x.toFixed(0))
                            .join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
