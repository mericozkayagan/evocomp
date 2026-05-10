"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  GAConfig,
  GARunner,
  GenerationStat,
  CrossoverMethod,
  MutationMethod,
  SelectionMethod,
} from "@/lib/ga";
import { buildDistanceMatrix } from "@/lib/tsp";
import { INSTANCES, generateRandomInstance, TSPInstance } from "@/lib/tsplib";
import { mulberry32 } from "@/lib/rng";
import TSPCanvas from "@/components/TSPCanvas";
import FitnessChart from "@/components/FitnessChart";
import Link from "next/link";

const DEFAULTS: Omit<GAConfig, "numCities"> = {
  populationSize: 200,
  generations: 500,
  mutationRate: 0.2,
  crossoverRate: 0.9,
  elitism: 4,
  selection: "tournament",
  tournamentSize: 5,
  crossover: "ox1",
  mutation: "inversion",
  seed: 42,
};

type InstanceKey = "berlin52" | "eil51" | "random30" | "random100";

function getInstance(key: InstanceKey, seed: number): TSPInstance {
  if (key === "random30") return generateRandomInstance(30, mulberry32(seed));
  if (key === "random100") return generateRandomInstance(100, mulberry32(seed));
  return INSTANCES[key];
}

export default function Home() {
  const [instanceKey, setInstanceKey] = useState<InstanceKey>("berlin52");
  const [params, setParams] = useState<typeof DEFAULTS>(DEFAULTS);
  const [running, setRunning] = useState(false);
  const [bestLength, setBestLength] = useState<number | null>(null);
  const [bestTour, setBestTour] = useState<number[] | null>(null);
  const [generation, setGeneration] = useState(0);
  const [history, setHistory] = useState<GenerationStat[]>([]);
  const runnerRef = useRef<GARunner | null>(null);
  const rafRef = useRef<number | null>(null);

  const instance = useMemo(
    () => getInstance(instanceKey, params.seed),
    [instanceKey, params.seed],
  );

  const optimal = instance.optimal;

  const reset = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    runnerRef.current = null;
    setRunning(false);
    setBestLength(null);
    setBestTour(null);
    setGeneration(0);
    setHistory([]);
  };

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceKey, params.seed]);

  const start = () => {
    if (runnerRef.current === null) {
      const dist = buildDistanceMatrix(instance.cities);
      const cfg: GAConfig = { ...params, numCities: instance.cities.length };
      runnerRef.current = new GARunner(cfg, dist, mulberry32(params.seed));
      const snap = runnerRef.current.snapshot();
      setBestLength(snap.bestLength);
      setBestTour(snap.bestTour);
      setGeneration(snap.generation);
      setHistory(runnerRef.current.getHistory().slice());
    }
    setRunning(true);
  };

  const pause = () => {
    setRunning(false);
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  useEffect(() => {
    if (!running || !runnerRef.current) return;
    let cancelled = false;

    const loop = () => {
      if (cancelled || !runnerRef.current) return;
      // Run a small batch of generations per frame to keep the UI responsive
      // while still progressing quickly on large generation counts.
      const batch = 5;
      for (let i = 0; i < batch && !runnerRef.current.isFinished(); i++) {
        runnerRef.current.step();
      }
      const snap = runnerRef.current.snapshot();
      setBestLength(snap.bestLength);
      setBestTour(snap.bestTour);
      setGeneration(snap.generation);
      setHistory(runnerRef.current.getHistory().slice());
      if (runnerRef.current.isFinished()) {
        setRunning(false);
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [running]);

  const updateParam = <K extends keyof typeof DEFAULTS>(
    key: K,
    value: (typeof DEFAULTS)[K],
  ) => {
    setParams((p) => ({ ...p, [key]: value }));
    reset();
  };

  const gap =
    bestLength !== null && optimal > 0
      ? ((bestLength - optimal) / optimal) * 100
      : null;

  const finished = generation >= params.generations && generation > 0;

  return (
    <div className="min-h-full bg-zinc-50 px-6 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight">
              GA-TSP — Genetic Algorithm for the Traveling Salesperson Problem
            </h1>
            <Link
              href="/experiments"
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              data-testid="nav-experiments"
            >
              Experiments →
            </Link>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Ege University · Computer Engineering · Evolutionary Computing,
            Spring 2026
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-4">
              <Stat label="Generation" value={String(generation)} testId="stat-generation" />
              <Stat
                label="Best length"
                value={bestLength !== null ? bestLength.toFixed(2) : "—"}
                testId="stat-best"
              />
              <Stat
                label="Optimum"
                value={optimal > 0 ? String(optimal) : "n/a"}
                testId="stat-optimum"
              />
              <Stat
                label="Gap"
                value={gap !== null ? `${gap.toFixed(2)}%` : "—"}
                testId="stat-gap"
              />
            </div>

            <div className="flex justify-center">
              <TSPCanvas cities={instance.cities} tour={bestTour} />
            </div>
            <div className="flex justify-center">
              <FitnessChart history={history} optimal={optimal} />
            </div>
          </div>

          <aside className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={start}
                disabled={running || finished}
                className="rounded-md bg-blue-600 px-3 py-1.5 font-medium text-white disabled:opacity-50"
                data-testid="btn-start"
              >
                {finished ? "Done" : generation === 0 ? "Start" : "Resume"}
              </button>
              <button
                type="button"
                onClick={pause}
                disabled={!running}
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 font-medium dark:border-zinc-700 dark:bg-zinc-900 disabled:opacity-50"
                data-testid="btn-pause"
              >
                Pause
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 font-medium dark:border-zinc-700 dark:bg-zinc-900"
                data-testid="btn-reset"
              >
                Reset
              </button>
            </div>

            <Field label="Instance">
              <select
                value={instanceKey}
                onChange={(e) => setInstanceKey(e.target.value as InstanceKey)}
                className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
                data-testid="select-instance"
              >
                <option value="berlin52">berlin52 (52 cities, opt 7542)</option>
                <option value="eil51">eil51 (51 cities, opt 426)</option>
                <option value="random30">random-30 (seeded)</option>
                <option value="random100">random-100 (seeded)</option>
              </select>
            </Field>

            <Field label={`Population size: ${params.populationSize}`}>
              <input
                type="range"
                min={20}
                max={500}
                step={10}
                value={params.populationSize}
                onChange={(e) =>
                  updateParam("populationSize", Number(e.target.value))
                }
                className="w-full"
                data-testid="input-population"
              />
            </Field>

            <Field label={`Generations: ${params.generations}`}>
              <input
                type="range"
                min={50}
                max={2000}
                step={50}
                value={params.generations}
                onChange={(e) =>
                  updateParam("generations", Number(e.target.value))
                }
                className="w-full"
                data-testid="input-generations"
              />
            </Field>

            <Field
              label={`Mutation rate: ${params.mutationRate.toFixed(2)}`}
            >
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={params.mutationRate}
                onChange={(e) =>
                  updateParam("mutationRate", Number(e.target.value))
                }
                className="w-full"
                data-testid="input-mutation-rate"
              />
            </Field>

            <Field
              label={`Crossover rate: ${params.crossoverRate.toFixed(2)}`}
            >
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={params.crossoverRate}
                onChange={(e) =>
                  updateParam("crossoverRate", Number(e.target.value))
                }
                className="w-full"
                data-testid="input-crossover-rate"
              />
            </Field>

            <Field label={`Elitism: ${params.elitism}`}>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={params.elitism}
                onChange={(e) => updateParam("elitism", Number(e.target.value))}
                className="w-full"
                data-testid="input-elitism"
              />
            </Field>

            <Field label="Selection">
              <select
                value={params.selection}
                onChange={(e) =>
                  updateParam(
                    "selection",
                    e.target.value as SelectionMethod,
                  )
                }
                className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
                data-testid="select-selection"
              >
                <option value="tournament">Tournament</option>
                <option value="roulette">Roulette</option>
                <option value="rank">Rank</option>
              </select>
            </Field>

            {params.selection === "tournament" && (
              <Field label={`Tournament k: ${params.tournamentSize}`}>
                <input
                  type="range"
                  min={2}
                  max={20}
                  step={1}
                  value={params.tournamentSize}
                  onChange={(e) =>
                    updateParam("tournamentSize", Number(e.target.value))
                  }
                  className="w-full"
                  data-testid="input-tournament-size"
                />
              </Field>
            )}

            <Field label="Crossover operator">
              <select
                value={params.crossover}
                onChange={(e) =>
                  updateParam("crossover", e.target.value as CrossoverMethod)
                }
                className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
                data-testid="select-crossover"
              >
                <option value="ox1">OX1 (Order)</option>
                <option value="pmx">PMX (Partially Mapped)</option>
              </select>
            </Field>

            <Field label="Mutation operator">
              <select
                value={params.mutation}
                onChange={(e) =>
                  updateParam("mutation", e.target.value as MutationMethod)
                }
                className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
                data-testid="select-mutation"
              >
                <option value="inversion">Inversion</option>
                <option value="swap">Swap</option>
                <option value="scramble">Scramble</option>
              </select>
            </Field>

            <Field label={`Seed: ${params.seed}`}>
              <input
                type="number"
                value={params.seed}
                onChange={(e) => updateParam("seed", Number(e.target.value))}
                className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
                data-testid="input-seed"
              />
            </Field>
          </aside>
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  testId,
}: {
  label: string;
  value: string;
  testId: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      <span className="font-mono text-base font-semibold" data-testid={testId}>
        {value}
      </span>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      <span className="text-zinc-700 dark:text-zinc-300">{label}</span>
      {children}
    </label>
  );
}
