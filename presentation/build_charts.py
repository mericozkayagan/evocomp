#!/usr/bin/env python3
"""Build matplotlib bar charts from report/data/*.csv for presentation slides."""
import csv
import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "report" / "data"
OUT = ROOT / "presentation" / "assets"
OUT.mkdir(parents=True, exist_ok=True)

# Brand palette — kept consistent across all charts.
BLUE = "#2563eb"
GRAY = "#94a3b8"
GREEN = "#10b981"
RED = "#ef4444"


def load(path):
    rows = []
    with open(path, newline="") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append(
                {
                    "variant": r["variant"].strip('"'),
                    "mean_best": float(r["mean_best"]),
                    "std_best": float(r["std_best"]),
                    "mean_gap_pct": float(r["mean_gap_pct"]),
                }
            )
    return rows


def bar_chart(title, rows, value_key, ylabel, fname, value_color_map=None):
    labels = [r["variant"] for r in rows]
    values = [r[value_key] for r in rows]
    fig, ax = plt.subplots(figsize=(8, 4.5), dpi=160)
    colors = [
        value_color_map.get(l, BLUE) if value_color_map else BLUE for l in labels
    ]
    bars = ax.bar(labels, values, color=colors, edgecolor="#1e3a8a", linewidth=0.6)
    ax.set_ylabel(ylabel, fontsize=11)
    ax.set_title(title, fontsize=13, weight="bold", pad=12)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.grid(axis="y", linestyle="--", alpha=0.4)
    for b, v in zip(bars, values):
        ax.text(
            b.get_x() + b.get_width() / 2,
            b.get_height() + max(values) * 0.01,
            f"{v:.1f}" if value_key == "mean_gap_pct" else f"{v:.0f}",
            ha="center",
            va="bottom",
            fontsize=10,
        )
    plt.tight_layout()
    plt.savefig(OUT / fname, bbox_inches="tight", facecolor="white")
    plt.close()
    print(f"  wrote {fname}")


def grouped_chart(title, rows_a, rows_b, label_a, label_b, value_key, ylabel, fname):
    import numpy as np

    labels = [r["variant"] for r in rows_a]
    va = [r[value_key] for r in rows_a]
    vb = [r[value_key] for r in rows_b]
    x = np.arange(len(labels))
    w = 0.38
    fig, ax = plt.subplots(figsize=(9, 4.5), dpi=160)
    ax.bar(x - w / 2, va, w, label=label_a, color=BLUE, edgecolor="#1e3a8a", linewidth=0.6)
    ax.bar(x + w / 2, vb, w, label=label_b, color=GREEN, edgecolor="#064e3b", linewidth=0.6)
    ax.set_xticks(x)
    ax.set_xticklabels(labels)
    ax.set_ylabel(ylabel, fontsize=11)
    ax.set_title(title, fontsize=13, weight="bold", pad=12)
    ax.legend(frameon=False)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.grid(axis="y", linestyle="--", alpha=0.4)
    plt.tight_layout()
    plt.savefig(OUT / fname, bbox_inches="tight", facecolor="white")
    plt.close()
    print(f"  wrote {fname}")


def main():
    suites = ["mutation_op", "crossover_op", "selection_method", "mutation_rate", "population_size", "elitism"]
    # Mutation operator gap, berlin52
    rows = load(DATA / "mutation_op_berlin52.csv")
    bar_chart(
        "Mutation Operator — berlin52 gap (lower is better)",
        rows,
        "mean_gap_pct",
        "Mean optimality gap (%)",
        "chart-mutation-gap.png",
        {"inversion": GREEN, "swap": GRAY, "scramble": RED},
    )

    # Selection method gap, berlin52
    rows = load(DATA / "selection_method_berlin52.csv")
    bar_chart(
        "Selection Method — berlin52 gap (lower is better)",
        rows,
        "mean_gap_pct",
        "Mean optimality gap (%)",
        "chart-selection-gap.png",
        {"tournament_k=5": GREEN, "tournament_k=2": GRAY, "roulette": RED, "rank": GRAY},
    )

    # Crossover operator
    rows = load(DATA / "crossover_op_berlin52.csv")
    bar_chart(
        "Crossover Operator — berlin52 gap",
        rows,
        "mean_gap_pct",
        "Mean optimality gap (%)",
        "chart-crossover-gap.png",
        {"ox1": BLUE, "pmx": GREEN},
    )

    # Population size
    rows = load(DATA / "population_size_berlin52.csv")
    bar_chart(
        "Population Size — berlin52 gap (diminishing returns)",
        rows,
        "mean_gap_pct",
        "Mean optimality gap (%)",
        "chart-population-gap.png",
    )

    # Mutation rate
    rows = load(DATA / "mutation_rate_berlin52.csv")
    bar_chart(
        "Mutation Rate Sweep — berlin52 gap (robust over a wide range)",
        rows,
        "mean_gap_pct",
        "Mean optimality gap (%)",
        "chart-mutation-rate.png",
    )

    # Cross-instance: mutation operator on both
    a = load(DATA / "mutation_op_berlin52.csv")
    b = load(DATA / "mutation_op_eil51.csv")
    grouped_chart(
        "Mutation Operator across Instances",
        a,
        b,
        "berlin52",
        "eil51",
        "mean_gap_pct",
        "Mean optimality gap (%)",
        "chart-mutation-cross.png",
    )


if __name__ == "__main__":
    main()
