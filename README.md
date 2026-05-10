# GA-TSP — Evolutionary Computing Project

Genetic algorithm for the Traveling Salesperson Problem.
Ege University · Computer Engineering · Evolutionary Computing, Spring 2026.

## What's in here

- `lib/ga.ts` — permutation-encoded GA: tournament/roulette/rank selection,
  OX1 + PMX crossover, swap/inversion/scramble mutation, elitism.
- `lib/tsp.ts` — TSP fitness, distance matrix.
- `lib/tsplib.ts` — bundled `berlin52` (opt 7542), `eil51` (opt 426),
  random instance generator.
- `lib/experiments.ts` — batch experiment driver with mean / std / gap
  aggregation.
- `app/page.tsx` — interactive web demo (cities + route + fitness curve).
- `app/experiments/page.tsx` — in-browser experiment runner.
- `scripts/run-experiments.ts` — headless runner that produces the CSVs in
  `report/data/` (used to fill the IEEE report tables).
- `report/main.tex` — IEEE conference paper draft (IEEEtran).
- `report/data/*.csv` — raw experiment results.

## Run

```bash
npm install
npm run dev               # http://localhost:3000 (or 3001 if 3000 busy)
npx tsx scripts/run-experiments.ts   # ~3 min, regenerates CSVs
```

## Compile the report

LaTeX is not installed on this machine. Two options:

1. **Overleaf**: upload `report/main.tex` to <https://www.overleaf.com>,
   click Recompile.
2. **Local**: install MacTeX (`brew install --cask mactex-no-gui`), then:
   ```bash
   cd report && pdflatex main.tex && pdflatex main.tex
   ```
   Two passes are needed for cross-references.

## Reproducibility

All randomness is driven by Mulberry32 seeded with an integer. Same seed
plus same parameters → identical evolution.
