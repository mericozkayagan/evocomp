"use client";

import { City, Tour } from "@/lib/tsp";

interface Props {
  cities: City[];
  tour: Tour | null;
  width?: number;
  height?: number;
  padding?: number;
}

export default function TSPCanvas({
  cities,
  tour,
  width = 600,
  height = 600,
  padding = 24,
}: Props) {
  if (cities.length === 0) {
    return (
      <svg
        width={width}
        height={height}
        className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        data-testid="tsp-canvas"
      />
    );
  }

  const xs = cities.map((c) => c.x);
  const ys = cities.map((c) => c.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);

  const project = (c: City): [number, number] => {
    const px = padding + ((c.x - minX) / spanX) * (width - 2 * padding);
    const py = padding + ((c.y - minY) / spanY) * (height - 2 * padding);
    return [px, py];
  };

  const points = cities.map(project);

  let pathD = "";
  if (tour && tour.length === cities.length) {
    pathD = tour
      .map((idx, i) => {
        const [px, py] = points[idx];
        return `${i === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`;
      })
      .join(" ");
    if (tour.length > 0) {
      const [sx, sy] = points[tour[0]];
      pathD += ` L ${sx.toFixed(2)} ${sy.toFixed(2)}`;
    }
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      data-testid="tsp-canvas"
      role="img"
      aria-label="Traveling salesman tour visualization"
    >
      {pathD && (
        <path
          d={pathD}
          stroke="#3b82f6"
          strokeWidth={1.5}
          fill="none"
          strokeLinejoin="round"
          data-testid="tsp-route"
        />
      )}
      {points.map(([px, py], i) => (
        <circle
          key={i}
          cx={px}
          cy={py}
          r={3.5}
          fill="#ef4444"
          stroke="#7f1d1d"
          strokeWidth={0.5}
          data-testid={`tsp-city-${i}`}
        />
      ))}
    </svg>
  );
}
