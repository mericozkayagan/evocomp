// Genetic Algorithm for the Traveling Salesperson Problem.
// Permutation representation, OX1 crossover, swap/inversion mutation,
// tournament selection, elitism, generational replacement.

import { Rng, randInt, shuffle } from "./rng";
import { Tour, tourLength } from "./tsp";

export type SelectionMethod = "tournament" | "roulette" | "rank";
export type CrossoverMethod = "ox1" | "pmx";
export type MutationMethod = "swap" | "inversion" | "scramble";

export interface GAConfig {
  numCities: number;
  populationSize: number;
  generations: number;
  mutationRate: number;
  crossoverRate: number;
  elitism: number;
  selection: SelectionMethod;
  tournamentSize: number;
  crossover: CrossoverMethod;
  mutation: MutationMethod;
  seed: number;
}

export interface GenerationStat {
  generation: number;
  bestLength: number;
  avgLength: number;
  worstLength: number;
}

export interface GAResult {
  bestTour: Tour;
  bestLength: number;
  history: GenerationStat[];
}

export function randomTour(n: number, rng: Rng): Tour {
  const t: Tour = [];
  for (let i = 0; i < n; i++) t.push(i);
  return shuffle(t, rng);
}

// Order Crossover (OX1): pick a slice from p1, fill the rest from p2 in order
// while preserving the relative order from p2.
export function ox1(p1: Tour, p2: Tour, rng: Rng): Tour {
  const n = p1.length;
  const a = randInt(rng, 0, n);
  const b = randInt(rng, 0, n);
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const child = new Array<number>(n).fill(-1);
  const taken = new Uint8Array(n);
  for (let i = lo; i <= hi; i++) {
    child[i] = p1[i];
    taken[p1[i]] = 1;
  }
  let k = (hi + 1) % n;
  for (let i = 0; i < n; i++) {
    const v = p2[(hi + 1 + i) % n];
    if (!taken[v]) {
      child[k] = v;
      k = (k + 1) % n;
    }
  }
  return child;
}

// Partially Mapped Crossover (PMX): another classical permutation operator,
// included to support comparison experiments.
export function pmx(p1: Tour, p2: Tour, rng: Rng): Tour {
  const n = p1.length;
  const a = randInt(rng, 0, n);
  const b = randInt(rng, 0, n);
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const child = p2.slice();
  const map = new Map<number, number>();
  for (let i = lo; i <= hi; i++) {
    child[i] = p1[i];
    map.set(p1[i], p2[i]);
  }
  for (let i = 0; i < n; i++) {
    if (i >= lo && i <= hi) continue;
    let v = child[i];
    let guard = 0;
    while (map.has(v) && guard++ < n) v = map.get(v)!;
    child[i] = v;
  }
  return child;
}

export function crossover(p1: Tour, p2: Tour, method: CrossoverMethod, rng: Rng): Tour {
  return method === "pmx" ? pmx(p1, p2, rng) : ox1(p1, p2, rng);
}

export function swapMutation(t: Tour, rng: Rng): void {
  const i = randInt(rng, 0, t.length);
  const j = randInt(rng, 0, t.length);
  [t[i], t[j]] = [t[j], t[i]];
}

export function inversionMutation(t: Tour, rng: Rng): void {
  const i = randInt(rng, 0, t.length);
  const j = randInt(rng, 0, t.length);
  let lo = Math.min(i, j);
  let hi = Math.max(i, j);
  while (lo < hi) {
    [t[lo], t[hi]] = [t[hi], t[lo]];
    lo++;
    hi--;
  }
}

export function scrambleMutation(t: Tour, rng: Rng): void {
  const i = randInt(rng, 0, t.length);
  const j = randInt(rng, 0, t.length);
  const lo = Math.min(i, j);
  const hi = Math.max(i, j);
  for (let k = hi; k > lo; k--) {
    const m = randInt(rng, lo, k + 1);
    [t[k], t[m]] = [t[m], t[k]];
  }
}

export function mutate(t: Tour, method: MutationMethod, rng: Rng): void {
  switch (method) {
    case "swap":
      swapMutation(t, rng);
      break;
    case "inversion":
      inversionMutation(t, rng);
      break;
    case "scramble":
      scrambleMutation(t, rng);
      break;
  }
}

export function tournamentSelect(
  population: Tour[],
  fitness: number[],
  k: number,
  rng: Rng,
): Tour {
  let bestIdx = randInt(rng, 0, population.length);
  for (let i = 1; i < k; i++) {
    const idx = randInt(rng, 0, population.length);
    if (fitness[idx] < fitness[bestIdx]) bestIdx = idx;
  }
  return population[bestIdx];
}

export function rouletteSelect(
  population: Tour[],
  fitness: number[],
  rng: Rng,
): Tour {
  // Convert minimization to maximization weights via inverse.
  let total = 0;
  const weights = new Array(population.length);
  for (let i = 0; i < population.length; i++) {
    weights[i] = 1 / (fitness[i] + 1e-9);
    total += weights[i];
  }
  let r = rng() * total;
  for (let i = 0; i < population.length; i++) {
    r -= weights[i];
    if (r <= 0) return population[i];
  }
  return population[population.length - 1];
}

export function rankSelect(
  population: Tour[],
  fitness: number[],
  rng: Rng,
): Tour {
  const idx = population.map((_, i) => i);
  idx.sort((a, b) => fitness[a] - fitness[b]);
  // Linear ranking: best = N, worst = 1.
  const n = idx.length;
  const total = (n * (n + 1)) / 2;
  let r = rng() * total;
  for (let rank = 0; rank < n; rank++) {
    r -= n - rank;
    if (r <= 0) return population[idx[rank]];
  }
  return population[idx[n - 1]];
}

export function select(
  method: SelectionMethod,
  population: Tour[],
  fitness: number[],
  tournamentSize: number,
  rng: Rng,
): Tour {
  switch (method) {
    case "tournament":
      return tournamentSelect(population, fitness, tournamentSize, rng);
    case "roulette":
      return rouletteSelect(population, fitness, rng);
    case "rank":
      return rankSelect(population, fitness, rng);
  }
}

export interface StepResult {
  generation: number;
  bestTour: Tour;
  bestLength: number;
  avgLength: number;
  worstLength: number;
  population: Tour[];
  fitness: number[];
}

// Stateful runner so the UI can step generation-by-generation, pause, resume.
export class GARunner {
  private population: Tour[] = [];
  private fitness: number[] = [];
  private generation = 0;
  private bestTour: Tour = [];
  private bestLength = Infinity;
  private history: GenerationStat[] = [];

  constructor(
    private readonly cfg: GAConfig,
    private readonly dist: Float64Array,
    private readonly rng: Rng,
  ) {
    this.init();
  }

  private init(): void {
    const { populationSize, numCities } = this.cfg;
    for (let i = 0; i < populationSize; i++) {
      const t = randomTour(numCities, this.rng);
      this.population.push(t);
      const len = tourLength(t, this.dist, numCities);
      this.fitness.push(len);
      if (len < this.bestLength) {
        this.bestLength = len;
        this.bestTour = t.slice();
      }
    }
    this.recordStats(0);
  }

  private recordStats(gen: number): void {
    let sum = 0;
    let worst = -Infinity;
    let best = Infinity;
    for (const f of this.fitness) {
      sum += f;
      if (f > worst) worst = f;
      if (f < best) best = f;
    }
    this.history.push({
      generation: gen,
      bestLength: best,
      avgLength: sum / this.fitness.length,
      worstLength: worst,
    });
  }

  step(): StepResult {
    if (this.generation >= this.cfg.generations) {
      return this.snapshot();
    }
    const cfg = this.cfg;
    const next: Tour[] = [];
    const nextFit: number[] = [];

    // Elitism: copy top-N unchanged.
    const sortedIdx = this.population.map((_, i) => i);
    sortedIdx.sort((a, b) => this.fitness[a] - this.fitness[b]);
    for (let i = 0; i < cfg.elitism && i < sortedIdx.length; i++) {
      const idx = sortedIdx[i];
      next.push(this.population[idx].slice());
      nextFit.push(this.fitness[idx]);
    }

    while (next.length < cfg.populationSize) {
      const p1 = select(
        cfg.selection,
        this.population,
        this.fitness,
        cfg.tournamentSize,
        this.rng,
      );
      const p2 = select(
        cfg.selection,
        this.population,
        this.fitness,
        cfg.tournamentSize,
        this.rng,
      );
      let child: Tour;
      if (this.rng() < cfg.crossoverRate) {
        child = crossover(p1, p2, cfg.crossover, this.rng);
      } else {
        child = p1.slice();
      }
      if (this.rng() < cfg.mutationRate) {
        mutate(child, cfg.mutation, this.rng);
      }
      next.push(child);
      nextFit.push(tourLength(child, this.dist, cfg.numCities));
    }

    this.population = next;
    this.fitness = nextFit;
    this.generation++;

    for (let i = 0; i < this.fitness.length; i++) {
      if (this.fitness[i] < this.bestLength) {
        this.bestLength = this.fitness[i];
        this.bestTour = this.population[i].slice();
      }
    }
    this.recordStats(this.generation);
    return this.snapshot();
  }

  snapshot(): StepResult {
    const last = this.history[this.history.length - 1];
    return {
      generation: this.generation,
      bestTour: this.bestTour.slice(),
      bestLength: this.bestLength,
      avgLength: last.avgLength,
      worstLength: last.worstLength,
      population: this.population,
      fitness: this.fitness,
    };
  }

  isFinished(): boolean {
    return this.generation >= this.cfg.generations;
  }

  getHistory(): GenerationStat[] {
    return this.history;
  }
}

export function runGA(
  cfg: GAConfig,
  dist: Float64Array,
  rng: Rng,
): GAResult {
  const runner = new GARunner(cfg, dist, rng);
  while (!runner.isFinished()) runner.step();
  const snap = runner.snapshot();
  return {
    bestTour: snap.bestTour,
    bestLength: snap.bestLength,
    history: runner.getHistory(),
  };
}
