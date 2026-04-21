"use client";

import { cn } from "@/lib/utils";
import type { ScoreBreakdown } from "@/lib/api";

export type ScoreBreakdownBar = ScoreBreakdown;

const DIMS = [
  { key: "title_score", paramKey: "Title", color: "bg-blue-500" },
  { key: "industry_score", paramKey: "Industry", color: "bg-emerald-500" },
  { key: "experience_score", paramKey: "Experience", color: "bg-amber-500" },
  { key: "skills_education_score", paramKey: "Skills & Education", color: "bg-violet-500" },
  { key: "hierarchy_score", paramKey: "Hierarchy", color: "bg-rose-500" },
  { key: "language_score", paramKey: "Language", color: "bg-teal-500" },
] as const;

export function ScoreBar({ score }: { score: ScoreBreakdownBar }) {
  const calc = score.score_calculation;
  const total = score.total ?? 0;

  if (calc?.length && total > 0) {
    const scale = 100 / total;
    return (
      <div className="flex h-6 w-full min-w-[120px] overflow-hidden rounded-md border bg-muted/30">
        {DIMS.map(({ key, color, paramKey }) => {
          const contrib = calc.find((c) => c.parameter === paramKey)?.contribution ?? 0;
          const pct = Math.max(0, Math.min(100, contrib * scale));
          const item = calc.find((c) => c.parameter === paramKey);
          const title = item
            ? `${paramKey}: ${item.value}×${item.weight}→${item.contribution} pts`
            : key;
          return (
            <div
              key={key}
              className={cn("transition-all", color)}
              style={{ width: `${pct}%` }}
              title={title}
            />
          );
        })}
      </div>
    );
  }

  const sum =
    (score.title_score ?? 0) +
    (score.industry_score ?? 0) +
    (score.experience_score ?? 0) +
    (score.skills_education_score ?? 0) +
    (score.hierarchy_score ?? 0) +
    (score.language_score ?? 0);
  const scale = sum > 0 ? 100 / sum : 0;
  return (
    <div className="flex h-6 w-full min-w-[120px] overflow-hidden rounded-md border bg-muted/30">
      {DIMS.map(({ key, color }) => {
        const raw = score[key as keyof ScoreBreakdownBar];
        const value = typeof raw === "number" ? raw : 0;
        const pct = Math.max(0, Math.min(100, value * scale));
        return (
          <div
            key={key}
            className={cn("transition-all", color)}
            style={{ width: `${pct}%` }}
            title={`${key}: ${value.toFixed(1)}`}
          />
        );
      })}
    </div>
  );
}
