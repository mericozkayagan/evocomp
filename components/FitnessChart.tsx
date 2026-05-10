"use client";

import { GenerationStat } from "@/lib/ga";

interface Props {
  history: GenerationStat[];
  optimal?: number;
  width?: number;
  height?: number;
  padding?: number;
}

export default function FitnessChart({
  history,
  optimal,
  width = 600,
  height = 300,
  padding = 40,
}: Props) {
  if (history.length === 0) {
    return (
      <svg
        width={width}
        height={height}
        className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        data-testid="fitness-chart"
      />
    );
  }

  const gens = history.map((h) => h.generation);
  const allValues = history.flatMap((h) => [h.bestLength, h.avgLength]);
  if (optimal && optimal > 0) allValues.push(optimal);
  const minG = Math.min(...gens);
  const maxG = Math.max(...gens, 1);
  const minV = Math.min(...allValues);
  const maxV = Math.max(...allValues);
  const spanG = Math.max(1, maxG - minG);
  const spanV = Math.max(1, maxV - minV);

  const projX = (g: number) =>
    padding + ((g - minG) / spanG) * (width - 2 * padding);
  const projY = (v: number) =>
    height - padding - ((v - minV) / spanV) * (height - 2 * padding);

  const buildPath = (selector: (h: GenerationStat) => number) =>
    history
      .map(
        (h, i) =>
          `${i === 0 ? "M" : "L"} ${projX(h.generation).toFixed(2)} ${projY(
            selector(h),
          ).toFixed(2)}`,
      )
      .join(" ");

  const bestPath = buildPath((h) => h.bestLength);
  const avgPath = buildPath((h) => h.avgLength);

  const yTicks = 5;
  const xTicks = 5;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      data-testid="fitness-chart"
      role="img"
      aria-label="Best and average fitness across generations"
    >
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const v = minV + (i / yTicks) * spanV;
        const y = projY(v);
        return (
          <g key={`y${i}`}>
            <line
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            <text
              x={padding - 6}
              y={y + 4}
              textAnchor="end"
              fontSize={10}
              fill="#6b7280"
            >
              {v.toFixed(0)}
            </text>
          </g>
        );
      })}
      {Array.from({ length: xTicks + 1 }, (_, i) => {
        const g = minG + (i / xTicks) * spanG;
        const x = projX(g);
        return (
          <g key={`x${i}`}>
            <text
              x={x}
              y={height - padding + 16}
              textAnchor="middle"
              fontSize={10}
              fill="#6b7280"
            >
              {g.toFixed(0)}
            </text>
          </g>
        );
      })}
      {optimal && optimal > 0 && optimal >= minV && optimal <= maxV && (
        <line
          x1={padding}
          x2={width - padding}
          y1={projY(optimal)}
          y2={projY(optimal)}
          stroke="#10b981"
          strokeWidth={1}
          strokeDasharray="4 3"
          data-testid="optimal-line"
        />
      )}
      <path
        d={avgPath}
        stroke="#94a3b8"
        strokeWidth={1.2}
        fill="none"
        data-testid="avg-line"
      />
      <path
        d={bestPath}
        stroke="#2563eb"
        strokeWidth={1.8}
        fill="none"
        data-testid="best-line"
      />
      <g transform={`translate(${padding + 8}, ${padding + 8})`}>
        <rect width={120} height={48} fill="white" stroke="#e5e7eb" rx={4} />
        <line x1={8} x2={28} y1={14} y2={14} stroke="#2563eb" strokeWidth={2} />
        <text x={34} y={18} fontSize={11} fill="#111827">
          best
        </text>
        <line
          x1={8}
          x2={28}
          y1={30}
          y2={30}
          stroke="#94a3b8"
          strokeWidth={2}
        />
        <text x={34} y={34} fontSize={11} fill="#111827">
          population avg
        </text>
        {optimal && optimal > 0 && (
          <>
            <line
              x1={8}
              x2={28}
              y1={42}
              y2={42}
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="4 3"
            />
            <text x={34} y={45} fontSize={11} fill="#111827">
              optimum ({optimal})
            </text>
          </>
        )}
      </g>
    </svg>
  );
}
